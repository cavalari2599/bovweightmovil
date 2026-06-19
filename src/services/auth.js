import api from './api'

export async function forgotPassword(correo) {
  return api.post('/auth/forgot-password', { correo })
}

export async function resetPassword(correo, codigo, clave, clave_confirmation) {
  return api.post('/auth/reset-password', { correo, codigo, clave, clave_confirmation })
}
