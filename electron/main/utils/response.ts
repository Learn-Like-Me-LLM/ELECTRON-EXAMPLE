export const response = {
  ok: (data?: { code?: number; msg?: string; data?: any }) => {
    return {
      code: 200,
      msg: 'SUCCESS',
      data: null,
      ...data
    }
  },
  error: (data?: { code?: number; msg?: string; data?: any }) => {
    return {
      code: 500,
      msg: 'ERROR',
      ...data
    }
  }
}
