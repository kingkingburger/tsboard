/**
 * server/routers/admin/board/point/update
 *
 * 게시판 관리화면 > 포인트 > 업데이트 처리
 */

import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { updatePoints } from "../../../../database/admin/board/point/update"
import { fail, success, updateAccessToken } from "../../../../util/tools"
import { AdminBoardPointList } from "../../../../../src/interface/admin"

const defaultTypeCheck = {
  headers: t.Object({
    authorization: t.String(),
  }),
  cookie: t.Cookie({
    refresh: t.String(),
  }),
}

export const update = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET_KEY!,
    }),
  )
  .patch(
    "/updatepoints",
    async ({ jwt, cookie: { refresh }, headers, body }) => {
      const newAccessToken = await updateAccessToken(jwt, headers.authorization, refresh.value)
      if (body.boardUid < 1) {
        return fail(`Invalid board uid.`)
      }
      const points = Object.values(body.points)
      for (const point of points) {
        if (point.amount < 0 || point.amount > 10_000) {
          return fail(`Invalid point value. (0 ≤ point ≤ 10,000)`)
        }
      }

      updatePoints(body.boardUid, body.points as AdminBoardPointList)

      return success({
        newAccessToken,
      })
    },
    {
      ...defaultTypeCheck,
      body: t.Object({
        boardUid: t.Number(),
        points: t.Object({
          view: t.Object({
            isPayment: t.Boolean(),
            amount: t.Number(),
          }),
          write: t.Object({
            isPayment: t.Boolean(),
            amount: t.Number(),
          }),
          comment: t.Object({
            isPayment: t.Boolean(),
            amount: t.Number(),
          }),
          download: t.Object({
            isPayment: t.Boolean(),
            amount: t.Number(),
          }),
        }),
      }),
    },
  )