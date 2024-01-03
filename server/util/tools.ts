/**
 * server/util/tools
 *
 * 서버단에서 활용할 함수들 정의
 */

// 랜덤 문자 6개 반환하는 함수, 인증 코드로 활용한다
export function generateRandomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz0123456789"
  let random = ""

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * chars.length)
    random += chars.charAt(index)
  }
  return random
}