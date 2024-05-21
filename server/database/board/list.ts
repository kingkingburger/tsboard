/**
 * server/database/board/list
 *
 * 게시판 목록보기에 필요한 함수들
 */

import { RowDataPacket } from "mysql2"
import {
  BoardConfig,
  Pair,
  Post,
  PostParams,
  PostRelated,
  PostRelatedParams,
  SearchOption,
  SearchPostParams,
  Writer,
} from "../../../src/interface/board"
import { table, select } from "../common"
import {
  BOARD_CONFIG,
  PAGING_DIRECTION,
  POST_RELATED,
  CONTENT_STATUS,
  SEARCH_OPTION,
} from "./const"
import { getTotalCommentCount } from "./comment"
import { getCategories } from "./editor"

// 게시판 기본 설정 가져오기
export async function getBoardConfig(id: string): Promise<BoardConfig> {
  let result: BoardConfig = BOARD_CONFIG
  const [board] =
    await select(`SELECT uid, group_uid, admin_uid, type, name, info, row_count, width, use_category, 
  level_list, level_view, level_write, level_comment, level_download, 
  point_view, point_write, point_comment, point_download
  FROM ${table}board WHERE id = '${id}' LIMIT 1`)
  if (!board) {
    return result
  }

  const category = await getCategories(board.uid)
  const [group] = await select(`SELECT admin_uid FROM ${table}group WHERE uid = ? LIMIT 1`, [
    board.group_uid,
  ])

  result = {
    uid: board.uid,
    admin: {
      group: group.admin_uid,
      board: board.admin_uid,
    },
    type: board.type,
    name: board.name,
    info: board.info,
    rowCount: board.row_count,
    width: board.width,
    useCategory: board.use_category > 0 ? true : false,
    category,
    level: {
      list: board.level_list,
      view: board.level_view,
      write: board.level_write,
      comment: board.level_comment,
      download: board.level_download,
    },
    point: {
      view: board.point_view,
      write: board.point_write,
      comment: board.point_comment,
      download: board.point_download,
    },
  }

  return result
}

// 유효한 최대 uid 값 반환하기
export async function getMaxPostUid(boardUid: number): Promise<number> {
  const [post] = await select(
    `SELECT MAX(uid) AS max_uid FROM ${table}post WHERE board_uid = ? AND status != ?`,
    [boardUid.toString(), CONTENT_STATUS.REMOVED.toString()],
  )
  if (!post) {
    return 0
  }
  return post.max_uid
}

// 총 게시글 개수 반환하기
export async function getTotalPostCount(boardUid: number): Promise<number> {
  const [total] = await select(
    `SELECT COUNT(*) AS count FROM ${table}post WHERE board_uid = ? AND status != ?`,
    [boardUid.toString(), CONTENT_STATUS.REMOVED.toString()],
  )
  if (!total) {
    return 0
  }
  return total.count
}

// 작성자 정보 가져오기
export async function getUserBasic(userUid: number): Promise<Writer> {
  let result: Writer = {
    uid: 0,
    name: "",
    profile: "",
    signature: "",
  }

  const [user] = await select(
    `SELECT name, profile, signature FROM ${table}user WHERE uid = ? LIMIT 1`,
    [userUid.toString()],
  )
  if (!user) {
    return result
  }

  return {
    uid: userUid,
    name: user.name,
    profile: user.profile,
    signature: user.signature,
  }
}

// 게시글의 좋아요 수 반환하기
export async function getPostLikeCount(postUid: number): Promise<number> {
  const [like] = await select(
    `SELECT COUNT(*) AS total_count FROM ${table}post_like WHERE post_uid = ? AND liked = ?`,
    [postUid.toString(), "1"],
  )
  if (!like) {
    return 0
  }
  return like.total_count
}

// 게시글을 보고 있는 회원이 이 글을 좋아하는지 여부 반환하기
export async function isPostViewerLiked(postUid: number, accessUserUid: number): Promise<boolean> {
  if (accessUserUid < 1) {
    return false
  }

  const [isLiked] = await select(
    `SELECT liked FROM ${table}post_like WHERE post_uid = ? AND user_uid = ? AND liked = ? LIMIT 1`,
    [postUid.toString(), accessUserUid.toString(), "1"],
  )
  if (!isLiked) {
    return false
  }
  return true
}

// 카테고리 정보 가져오기
export async function getCategoryInfo(categoryUid: number): Promise<Pair> {
  let result: Pair = {
    uid: 0,
    name: "",
  }
  const [category] = await select(
    `SELECT uid, name FROM ${table}board_category WHERE uid = ? LIMIT 1`,
    [categoryUid.toString()],
  )
  if (!category) {
    return result
  }
  return {
    uid: category.uid,
    name: category.name,
  }
}

// 게시글에 연관된 정보 가져오기
export async function getPostRelated(param: PostRelatedParams): Promise<PostRelated> {
  let result: PostRelated = POST_RELATED
  const writer = await getUserBasic(param.writerUid)
  result.writer = writer
  result.like = await getPostLikeCount(param.uid)
  result.liked = await isPostViewerLiked(param.uid, param.viewerUid)
  result.category = await getCategoryInfo(param.categoryUid)
  result.reply = await getTotalCommentCount(param.uid)
  return result
}

// (검색된) 포스트들 결과로 정리하여 반환하기
async function makePostResult(posts: RowDataPacket[], accessUserUid: number): Promise<Post[]> {
  let result: Post[] = []
  for (const post of posts) {
    const info = await getPostRelated({
      uid: post.uid,
      writerUid: post.user_uid,
      viewerUid: accessUserUid,
      categoryUid: post.category_uid,
    })

    result.push({
      uid: post.uid,
      writer: info.writer,
      like: info.like,
      liked: info.liked,
      submitted: post.submitted,
      status: post.status,
      category: info.category,
      reply: info.reply,
      title: post.title,
      hit: post.hit,
    })
  }
  return result
}

// 공지글 가져오기
async function getNotices(boardUid: number, accessUserUid: number): Promise<Post[]> {
  let result: Post[] = []
  const notices = await select(
    `SELECT uid, user_uid, category_uid, title, submitted, hit, status 
    FROM ${table}post WHERE board_uid = ? AND status = ?`,
    [boardUid.toString(), CONTENT_STATUS.NOTICE.toString()],
  )
  result.push(...(await makePostResult(notices, accessUserUid)))
  return result
}

// 주어진 해시태그들의 고유 번호를 문자열로 반환
export async function getHashtagUids(tags: string[]): Promise<string> {
  let result: string[] = []
  for (const tag of tags) {
    const [hashtag] = await select(
      `SELECT uid FROM ${table}hashtag WHERE name LIKE '%${tag}%' LIMIT 1`,
    )
    if (hashtag) {
      result.push(hashtag.uid)
    }
  }
  return result.join("', '")
}

// 제목 혹은 본문 검색
async function searchTitleContent(param: SearchPostParams): Promise<RowDataPacket[]> {
  const option = param.option === (SEARCH_OPTION.TITLE as SearchOption) ? "title" : "content"
  const result = await select(
    `SELECT uid, user_uid, category_uid, title, submitted, hit, status 
    FROM ${table}post WHERE board_uid = ? AND status = ? AND ${option} 
    LIKE '%${param.keyword}%' AND uid ${param.direction} ? 
    ORDER BY uid ${param.ordering} LIMIT ?`,
    [
      param.boardUid.toString(),
      CONTENT_STATUS.NORMAL.toString(),
      param.sinceUid.toString(),
      (param.bunch - param.noticeCount).toString(),
    ],
  )
  return result
}

// 글 작성자 이름으로 검색
async function searchWriterName(param: SearchPostParams): Promise<RowDataPacket[]> {
  let result: RowDataPacket[] = []
  const [writer] = await select(`SELECT uid FROM ${table}user WHERE name = ? LIMIT 1`, [
    param.keyword,
  ])
  if (writer) {
    result = await select(
      `SELECT uid, user_uid, category_uid, title, submitted, hit, status 
    FROM ${table}post WHERE board_uid = ? AND status = ? AND user_uid = ? AND uid ${param.direction} ? 
    ORDER BY uid ${param.ordering} LIMIT ?`,
      [
        param.boardUid.toString(),
        CONTENT_STATUS.NORMAL.toString(),
        writer.uid,
        param.sinceUid,
        (param.bunch - param.noticeCount).toString(),
      ],
    )
  }
  return result
}

// 카테고리 번호로 검색
async function searchCategoryUid(param: SearchPostParams): Promise<RowDataPacket[]> {
  const categoryUid = parseInt(param.keyword)
  const result = await select(
    `SELECT uid, user_uid, category_uid, title, submitted, hit, status 
    FROM ${table}post WHERE board_uid = ? AND category_uid = ? AND status = ? AND uid ${param.direction} ? 
    ORDER BY uid ${param.ordering} LIMIT ?`,
    [
      param.boardUid.toString(),
      categoryUid.toString(),
      CONTENT_STATUS.NORMAL.toString(),
      param.sinceUid.toString(),
      (param.bunch - param.noticeCount).toString(),
    ],
  )
  return result
}

// 태그명으로 검색
async function searchTagName(param: SearchPostParams): Promise<RowDataPacket[]> {
  const tags = param.keyword.split(" ")
  const tagUidStr = await getHashtagUids(tags)
  const result = await select(
    `SELECT uid, user_uid, category_uid, title, submitted, hit, status 
    FROM ${table}post JOIN ${table}post_hashtag ON ${table}post.uid = ${table}post_hashtag.post_uid 
    WHERE ${table}post_hashtag.board_uid = ? AND ${table}post.status = ? AND uid ${param.direction} ? AND ${table}post_hashtag.hashtag_uid IN ('${tagUidStr}')
    GROUP BY ${table}post_hashtag.post_uid HAVING (COUNT(${table}post_hashtag.hashtag_uid) = ?)
    ORDER BY ${table}post.uid ${param.ordering} LIMIT ?`,
    [
      param.boardUid.toString(),
      CONTENT_STATUS.NORMAL.toString(),
      param.sinceUid.toString(),
      tags.length.toString(),
      (param.bunch - param.noticeCount).toString(),
    ],
  )
  return result
}

// 검색어가 있을 경우의 글 목록 가져오기
export async function getSearchedPosts(param: SearchPostParams): Promise<RowDataPacket[]> {
  let result: RowDataPacket[] = []

  if (
    param.option === (SEARCH_OPTION.TITLE as SearchOption) ||
    param.option === (SEARCH_OPTION.CONTENT as SearchOption)
  ) {
    result = await searchTitleContent(param)
  } else if (param.option === (SEARCH_OPTION.WRITER as SearchOption)) {
    result = await searchWriterName(param)
  } else if (param.option === (SEARCH_OPTION.CATEGORY as SearchOption)) {
    result = await searchCategoryUid(param)
  } else if (param.option === (SEARCH_OPTION.TAG as SearchOption)) {
    result = await searchTagName(param)
  }
  return result
}

// 글 목록 가져오기
export async function getPosts(param: PostParams): Promise<Post[]> {
  let result: Post[] = []
  const notices = await getNotices(param.boardUid, param.accessUserUid)
  result.push(...notices)

  let direction: ">" | "<" = ">"
  let ordering: "ASC" | "DESC" = "ASC"
  param.sinceUid -= 1
  if (param.pagingDirection === PAGING_DIRECTION.NEXT) {
    direction = "<"
    ordering = "DESC"
    param.sinceUid += 2
  }

  let posts: RowDataPacket[] = []
  if (param.keyword.length > 0) {
    posts = await getSearchedPosts({
      ...param,
      direction,
      ordering,
      noticeCount: notices.length,
    })
  } else {
    posts = await select(
      `SELECT uid, user_uid, category_uid, title, content, submitted, modified, hit, status 
    FROM ${table}post WHERE board_uid = ? AND (status = ? OR status = ?) AND uid ${direction} ? ORDER BY uid ${ordering} LIMIT ?`,
      [
        param.boardUid.toString(),
        CONTENT_STATUS.NORMAL.toString(),
        CONTENT_STATUS.SECRET.toString(),
        param.sinceUid.toString(),
        (param.bunch - notices.length).toString(),
      ],
    )
  }

  const normals = await makePostResult(posts, param.accessUserUid)
  result.push(...normals)
  return result
}

// 레벨 제한이 있을 시 회원의 레벨 가져오기
export async function getUserLevel(userUid: number): Promise<number> {
  let level = 0
  const [user] = await select(`SELECT level FROM ${table}user WHERE uid = ? LIMIT 1`, [
    userUid.toString(),
  ])
  if (user) {
    level = user.level
  }
  return level
}

// (글목록을 보는 회원의) 블랙리스트를 반환하기
export async function getBlackList(userUid: number): Promise<number[]> {
  let result: number[] = []
  const blacks = await select(`SELECT black_uid FROM ${table}user_black_list WHERE user_uid = ?`, [
    userUid.toString(),
  ])

  for (const black of blacks) {
    result.push(black.black_uid as number)
  }

  return result
}
