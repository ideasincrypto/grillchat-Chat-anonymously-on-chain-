import { ESTIMATED_ENERGY_FOR_ONE_TX } from '@/constants/subsocial'
import { ApiResponse, getServerAccount, handlerWrapper } from '@/server/common'
import { getSubsocialApi } from '@/subsocial-query/subsocial/connection'
import { validateAddress } from '@/utils/account'
import { getCaptchaSecret } from '@/utils/env/server'
import { z } from 'zod'

const bodySchema = z.object({
  captchaToken: z.string(),
  address: z.string(),
})
export type ApiRequestTokenBody = z.infer<typeof bodySchema>

type ResponseData = {
  data?: string
  hash?: string
}
export type ApiRequestTokenResponse = ApiResponse<ResponseData>

const VERIFIER = 'https://www.google.com/recaptcha/api/siteverify'
const BURN_AMOUNT = 0.5 * 10 ** 10

export default handlerWrapper({
  inputSchema: bodySchema,
  dataGetter: (req) => req.body,
})<ResponseData>({
  allowedMethods: ['POST'],
  handler: async (data, _, res) => {
    const isValidAddress = await validateAddress(data.address)
    if (!isValidAddress)
      return res.status(400).send({
        success: false,
        message: 'Invalid address format',
      })

    if (getCaptchaSecret()) {
      try {
        await verifyCaptcha(data.captchaToken)
      } catch (e: any) {
        return res.status(400).send({
          success: false,
          message: 'Captcha failed',
          errors: e.message,
        })
      }
    }

    try {
      const isNeedEnergy = getIsAddressNeedEnergy(data.address)
      if (!isNeedEnergy)
        return res.status(200).send({ success: true, message: 'OK', data: '' })
    } catch {}

    let hash: string
    try {
      hash = await sendToken(data.address)
    } catch (e: any) {
      console.error('Failed to send token', e)

      if (typeof e.message === 'string' && e.message.startsWith('1010:')) {
        return res.status(400).send({
          success: false,
          message:
            'The faucet does not have a high enough balance, please contact the developers to refill it',
          errors: e.message,
        })
      }

      return res.status(500).send({
        success: false,
        message: 'Failed to send token',
        errors: e.message,
      })
    }

    return res.status(200).send({ success: true, message: 'OK', data: hash })
  },
})

async function getIsAddressNeedEnergy(address: string) {
  const { getSubsocialApi } = await import(
    '@/subsocial-query/subsocial/connection'
  )

  const subsocialApi = await getSubsocialApi()
  const substrateApi = await subsocialApi.substrateApi

  return new Promise((resolve) => {
    const unsub = substrateApi.query.energy.energyBalance(
      address,
      (energyAmount) => {
        let parsedEnergy: unknown = energyAmount
        if (typeof energyAmount.toPrimitive === 'function') {
          parsedEnergy = energyAmount.toPrimitive()
        }
        const energy = parseFloat(parsedEnergy + '')
        const isAddressNeedEnergy = energy < ESTIMATED_ENERGY_FOR_ONE_TX
        resolve(isAddressNeedEnergy)
        unsub.then((unsub) => unsub())
      }
    )
  })
}

async function getPaymentFee() {
  const signer = await getServerAccount()
  const subsocialApi = await getSubsocialApi()
  const substrateApi = await subsocialApi.substrateApi
  const paymentFee = await substrateApi.tx.energy
    .generateEnergy(signer.address, BURN_AMOUNT)
    .paymentInfo(signer.address)
  return paymentFee.partialFee.toNumber() + BURN_AMOUNT
}

async function isEnoughBalance() {
  const signer = await getServerAccount()
  const subsocialApi = await getSubsocialApi()
  const substrateApi = await subsocialApi.substrateApi
  const balance = await substrateApi.query.system.account(signer.address)
  const paymentFee = await getPaymentFee()
  return balance.data.free.toNumber() > paymentFee
}

async function verifyCaptcha(captchaToken: string) {
  const formData = new URLSearchParams()
  formData.append('secret', getCaptchaSecret())
  formData.append('response', captchaToken)
  const res = await fetch(VERIFIER, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  const jsonRes = (await res.json()) as any
  if (!jsonRes.success) throw new Error('Invalid Token')
  return true
}

async function sendToken(address: string) {
  const signer = await getServerAccount()
  if (!signer) throw new Error('Invalid Mnemonic')
  if (!(await isEnoughBalance()))
    throw new Error('Account balance is not enough')

  const subsocialApi = await getSubsocialApi()
  const substrateApi = await subsocialApi.substrateApi

  const tx = await substrateApi.tx.energy
    .generateEnergy(address, BURN_AMOUNT)
    .signAndSend(signer, { nonce: -1 })

  return tx.hash.toString()
}
