/**
 * server/database/board/comment
 *
 * 댓글 관련 처리
 */

import {
  Comment,
  CommentLikeParams,
  CommentParams,
  CommentRelated,
  PostStatus,
  RelatedParams,
  SaveCommentParams,
  SaveModifyParams,
  SaveReplyParams,
} from "../../../src/interface/board"
import { NoticeType } from "../../../src/interface/home"
import { insert, select, table, update } from "../common"
import { addNotification } from "../home/notification"
import {
  COMMENT_RELATED,
  INVALID_VIEW_LEVEL,
  NOTICE_TYPE,
  PAGING_DIRECTION,
  CONTENT_STATUS,
} from "./const"
import { getUserBasic } from "./list"

// 댓글에 달린 좋아요 수 반환하기
export async function getCommentLikeCount(commentUid: number): Promise<number> {
  const [like] = await select(
    `SELECT COUNT(*) AS total_count FROM ${table}comment_like WHERE comment_uid = ? AND liked = ?`,
    [commentUid.toString(), "1"],
  )
  if (!like) {
    return 0
  }
  return like.total_count
}

// 댓글을 보는 회원이 이 댓글을 좋아하는지 여부 확인하기
export async function isCommentViewerLiked(
  commentUid: number,
  accessUserUid: number,
): Promise<boolean> {
  const [isLiked] = await select(
    `SELECT liked FROM ${table}comment_like WHERE comment_uid = ? AND user_uid = ? AND liked = ? LIMIT 1`,
    [commentUid.toString(), accessUserUid.toString(), "1"],
  )
  if (!isLiked) {
    return false
  }
  return true
}

// 댓글에 연관된 정보 가져오기
async function getCommentRelated(param: RelatedParams): Promise<CommentRelated> {
  let result: CommentRelated = COMMENT_RELATED
  result.writer = await getUserBasic(param.writerUid)
  result.like = await getCommentLikeCount(param.uid)
  result.liked = await isCommentViewerLiked(param.uid, param.viewerUid)
  return result
}

// 댓글들 가져오기
// TODO
// 이전 | 다음 관련 처리하기
export async function getComments(param: CommentParams): Promise<Comment[]> {
  let result: Comment[] = []
  const comments = await select(
    `SELECT uid, reply_uid, user_uid, content, submitted, modified, status 
  FROM ${table}comment WHERE post_uid = ? AND status != ? AND uid ${
    param.pagingDirection === PAGING_DIRECTION.NEXT ? "<" : ">"
  } ? 
  ORDER BY reply_uid ASC LIMIT ?`,
    [
      param.postUid.toString(),
      CONTENT_STATUS.REMOVED.toString(),
      param.sinceUid.toString(),
      param.bunch.toString(),
    ],
  )
  for (const comment of comments) {
    const info = await getCommentRelated({
      uid: comment.uid,
      writerUid: comment.user_uid,
      viewerUid: param.accessUserUid,
    })
    result.push({
      uid: comment.uid,
      writer: info.writer,
      content: comment.content,
      like: info.like,
      liked: info.liked,
      submitted: comment.submitted,
      modified: comment.modified,
      status: comment.status,
      replyUid: comment.reply_uid,
      postUid: param.postUid,
    })
  }
  return result
}

// 유효한 최대 uid 값 반환하기
export async function getMaxCommentUid(postUid: number): Promise<number> {
  const [comment] = await select(
    `SELECT MAX(uid) AS max_uid FROM ${table}comment WHERE post_uid = ? AND status != ?`,
    [postUid.toString(), CONTENT_STATUS.REMOVED.toString()],
  )
  if (!comment) {
    return 0
  }
  return comment.max_uid
}

// 총 댓글 개수 반환하기
export async function getTotalCommentCount(postUid: number): Promise<number> {
  const [total] = await select(
    `SELECT COUNT(*) AS count FROM ${table}comment WHERE post_uid = ? AND status != ?`,
    [postUid.toString(), CONTENT_STATUS.REMOVED.toString()],
  )
  if (!total) {
    return 0
  }
  return total.count
}

// 게시판 ID에 해당하는 uid 반환하기
export async function getBoardUid(id: string): Promise<number> {
  const [board] = await select(`SELECT uid FROM ${table}board WHERE id = '${id}' LIMIT 1`)
  if (!board) {
    return 0
  }
  return board.uid
}

// 글보기 레벨 권한 조회하기
export async function getViewPostLevel(boardUid: number): Promise<number> {
  const [board] = await select(`SELECT level_view FROM ${table}board WHERE uid = ? LIMIT 1`, [
    boardUid.toString(),
  ])
  if (!board) {
    return INVALID_VIEW_LEVEL
  }
  return board.level_view
}

// 게시글 작성자 번호와 상태 가져오기
export async function getPostInfo(
  postUid: number,
): Promise<{ status: PostStatus; writerUid: number }> {
  let result = { status: CONTENT_STATUS.NORMAL as PostStatus, writerUid: 0 }
  const [post] = await select(`SELECT user_uid, status FROM ${table}post WHERE uid = ? LIMIT 1`, [
    postUid.toString(),
  ])
  if (post) {
    result.status = post.status as PostStatus
    result.writerUid = post.user_uid
  }
  return result
}

// 댓글 좋아하기 누르기
export async function likeComment(param: CommentLikeParams): Promise<void> {
  const commentUidQuery = param.commentUid.toString()
  const accessUserUidQuery = param.accessUserUid.toString()
  const likedQuery = param.liked.toString()
  const nowQuery = Date.now().toString()
  const [like] = await select(
    `SELECT comment_uid FROM ${table}comment_like WHERE comment_uid = ? AND user_uid = ? LIMIT 1`,
    [commentUidQuery, accessUserUidQuery],
  )
  if (!like) {
    await select(
      `INSERT INTO ${table}comment_like (board_uid, comment_uid, user_uid, liked, timestamp) 
    VALUES (?, ?, ?, ? ,?)`,
      [param.boardUid.toString(), commentUidQuery, accessUserUidQuery, likedQuery, nowQuery],
    )

    const [comment] = await select(
      `SELECT post_uid, user_uid FROM ${table}comment WHERE uid = ? LIMIT 1`,
      [commentUidQuery],
    )
    if (comment) {
      addNotification({
        toUid: comment.user_uid,
        fromUid: param.accessUserUid,
        type: NOTICE_TYPE.LIKE_COMMENT as NoticeType,
        postUid: comment.post_uid,
        commentUid: param.commentUid,
      })
    }
  } else {
    await update(
      `UPDATE ${table}comment_like SET liked = ?, timestamp = ? WHERE comment_uid = ? AND user_uid = ? LIMIT 1`,
      [likedQuery, nowQuery, commentUidQuery, accessUserUidQuery],
    )
  }
}

// 새 댓글 추가하기
export async function saveNewComment(param: SaveCommentParams): Promise<number> {
  let insertId = 0
  const postUidQuery = param.postUid.toString()
  insertId = await insert(
    `INSERT INTO ${table}comment 
    (reply_uid, board_uid, post_uid, user_uid, content, submitted, modified, status) VALUES
    (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "0",
      param.boardUid.toString(),
      postUidQuery,
      param.accessUserUid.toString(),
      param.content,
      Date.now().toString(),
      "0",
      "0",
    ],
  )
  if (insertId > 0) {
    const insertIdQuery = insertId.toString()
    await update(`UPDATE ${table}comment SET reply_uid = ? WHERE uid = ? LIMIT 1`, [
      insertIdQuery,
      insertIdQuery,
    ])
    const [post] = await select(`SELECT user_uid FROM ${table}post WHERE uid = ? LIMIT 1`, [
      postUidQuery,
    ])
    if (post) {
      addNotification({
        toUid: post.user_uid,
        fromUid: param.accessUserUid,
        type: NOTICE_TYPE.LEAVE_COMMENT as NoticeType,
        postUid: param.postUid,
        commentUid: insertId,
      })
    }
  }
  return insertId
}

// 답글 추가하기
export async function saveReplyComment(param: SaveReplyParams): Promise<number> {
  let insertId = await insert(
    `INSERT INTO ${table}comment (reply_uid, board_uid, post_uid, user_uid, content, submitted, modified, status) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      param.replyTargetUid.toString(),
      param.boardUid.toString(),
      param.postUid.toString(),
      param.accessUserUid.toString(),
      param.content,
      Date.now().toString(),
      "0",
      "0",
    ],
  )
  const [comment] = await select(`SELECT user_uid FROM ${table}comment WHERE uid = ? LIMIT 1`, [
    param.replyTargetUid.toString(),
  ])
  if (comment) {
    addNotification({
      toUid: comment.user_uid,
      fromUid: param.accessUserUid,
      type: NOTICE_TYPE.REPLY_COMMENT as NoticeType,
      postUid: param.postUid,
      commentUid: insertId,
    })
  }
  return insertId
}

// 댓글 수정하기
export async function saveModifyComment(param: SaveModifyParams): Promise<void> {
  await update(`UPDATE ${table}comment SET content = ?, modified = ? WHERE uid = ? LIMIT 1`, [
    param.content,
    Date.now().toString(),
    param.modifyTargetUid.toString(),
  ])
}

// 댓글 내용만 비우기
async function cleanupComment(commentUid: number): Promise<boolean> {
  update(`UPDATE ${table}comment SET content = ?, modified = ? WHERE uid = ? LIMIT 1`, [
    "",
    Date.now().toString(),
    commentUid.toString(),
  ])
  return false
}

// 댓글 내용은 보존하고 삭제 상태로 변경하기
async function setRemoveStatus(commentUid: number): Promise<boolean> {
  update(`UPDATE ${table}comment SET status = ?, modified = ? WHERE uid = ? LIMIT 1`, [
    CONTENT_STATUS.REMOVED.toString(),
    Date.now().toString(),
    commentUid.toString(),
  ])
  return true
}

// 댓글 삭제하기, 답글이 달려져 있을 경우 내용만 지우고 삭제 처리 하지 않음
export async function removeComment(removeTargetUid: number): Promise<boolean> {
  const removeTargetUidQuery = removeTargetUid.toString()
  const [comment] = await select(
    `SELECT uid, reply_uid FROM ${table}comment WHERE uid = ? LIMIT 1`,
    [removeTargetUidQuery],
  )
  if (!comment) {
    return false
  }

  if (comment.uid === comment.reply_uid) {
    const [reply] = await select(
      `SELECT uid FROM ${table}comment WHERE reply_uid = ? AND uid != ? LIMIT 1`,
      [removeTargetUidQuery, removeTargetUidQuery],
    )
    if (reply) {
      return cleanupComment(removeTargetUid)
    } else {
      return setRemoveStatus(removeTargetUid)
    }
  }
  return setRemoveStatus(removeTargetUid)
}
