/**
 * server/routers/board/list
 *
 * 게시판 목록보기 처리
 */

import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { getBoardConfig } from "../../database/board/list"
import { fail, success, getUpdatedAccessToken } from "../../util/tools"

export const list = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET_KEY!,
    }),
  )
  .get(
    "/config",
    async ({ query: { id } }) => {
      if (id.length < 2) {
        return fail(`Invalid board ID.`)
      }
      const config = await getBoardConfig(id)
      return success({
        config,
      })
    },
    {
      query: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    "/list",
    async ({ jwt, cookie: { refresh }, headers, query: { boardUid, page, bunch } }) => {
      if (boardUid < 1) {
        return fail(`Invalid board uid.`)
      }
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
      cookie: t.Cookie({
        refresh: t.String(),
      }),
      query: t.Object({
        boardUid: t.Numeric(),
        page: t.Numeric(),
        bunch: t.Numeric(),
      }),
    },
  )
