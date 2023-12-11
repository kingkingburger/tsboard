/**
 * install/table/query.ts
 *
 * 테이블 구조 정의 모음
 */
const create = "CREATE TABLE IF NOT EXISTS"
const prefix = process.env.DB_TABLE_PREFIX ?? "tsb_"
const nnd = "NOT NULL DEFAULT"
const nnd0 = `${nnd} '0'`
const nnde = `${nnd} ''`
const unnd = `UNSIGNED ${nnd}`
const unnd0 = `${unnd} '0'`
const uid = "uid INT(11) UNSIGNED NOT NULL auto_increment"
const primary = "PRIMARY KEY (`uid`)"
const engineEncode = `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`

export const tables: string[] = []

// v0.8.0 Initial version
// 사용자 기본 정보 테이블, blocked = 1 일 경우 차단된 사용자
tables.push(`${create} ${prefix}user (
  ${uid},
  id VARCHAR(100) ${nnde},
  name VARCHAR(10) ${nnde},
  password CHAR(64) ${nnde},
  profile VARCHAR(300) ${nnde},
  level TINYINT(2) ${unnd0},
  point INT(11) ${unnd0},
  signature VARCHAR(300) ${nnde},
  signup BIGINT(14) ${unnd0},
  signin BIGINT(14) ${unnd0},
  blocked TINYINT(1) ${unnd0},
  ${primary}
) ${engineEncode}`)

// 사용자 인증용 토근 관리 테이블
tables.push(`${create} ${prefix}user_token (
  user_uid INT(11) ${unnd0},
  access VARCHAR(300) ${nnde},
  refresh VARCHAR(100) ${nnde},
  timestamp_access BIGINT(14) ${unnd0},
  timestamp_refresh BIGINT(14) ${unnd0},
  KEY (user_uid)
) ${engineEncode}`)

// 사용자의 권한들은 1 = 차단 / 0 = 가능
tables.push(`${create} ${prefix}user_permission (
  ${uid},
  user_uid INT(11) ${unnd0},
  write_post TINYINT(1) UNSIGNED ${nnd} '1',
  write_comment TINYINT(1) UNSIGNED ${nnd} '1',
  note TINYINT(1) UNSIGNED ${nnd} '1',
  report TINYINT(1) UNSIGNED ${nnd} '1',
  ${primary},
  KEY (user_uid)
) ${engineEncode}`)

// 가입 시 사용자 인증용 테이블
tables.push(`${create} ${prefix}user_verification (
  ${uid},
  email VARCHAR(100) ${nnde},
  code CHAR(6) ${nnde},
  timestamp BIGINT(14) ${unnd0},
  ${primary}
) ${engineEncode}`)

// 사용자 접속 기록, ip 주소는 MySQL 내장 함수 INET_ATON() 이용, 숫자 형태로 저장한다
tables.push(`${create} ${prefix}user_access_log (
  ${uid},
  user_uid INT(11) ${unnd0},
  ip INT(11) ${unnd0},
  timestamp BIGINT(14) ${unnd0},
  ${primary}
) ${engineEncode}`)

// 신고 내역
tables.push(`${create} ${prefix}report (
  ${uid},
  to_uid INT(11) ${unnd0},
  from_uid INT(11) ${unnd0},
  request VARCHAR(1000) ${nnde},
  response VARCHAR(1000) ${nnde},
  timestamp BIGINT(14) ${nnd0},
  solved TINYINT(1) ${unnd0},
  ${primary},
  KEY (solved)
) ${engineEncode}`)

// 그룹 관리용 테이블
tables.push(`${create} ${prefix}group (
  ${uid},
  id VARCHAR(20) ${nnde},
  admin_uid INT(11) ${unnd0},
  timestamp BIGINT(14) ${unnd0},
  ${primary}
) ${engineEncode}`)

// 게시판 관리용 테이블 (type = 0 게시판 / 1 갤러리 / 2 블로그(TBD))
tables.push(`${create} ${prefix}board (
  ${uid},
  id VARCHAR(20) ${nnde},
  group_uid INT(11) ${unnd0},
  admin_uid INT(11) ${unnd0},
  type TINYINT(1) ${nnd0},
  name VARCHAR(20) ${nnde},
  info VARCHAR(100) ${nnde},
  row TINYINT(2) UNSIGNED ${nnd} '20',
  use_category TINYINT(1) ${unnd0},
  level_list TINYINT(2) ${unnd0},
  level_view TINYINT(2) ${unnd0},
  level_write TINYINT(2) ${unnd0},
  level_comment TINYINT(2) ${unnd0},
  level_download TINYINT(2) ${unnd0},
  point_view INT(11) ${nnd0},
  point_write INT(11) ${nnd0},
  point_comment INT(11) ${nnd0},
  point_download INT(11) ${nnd0},
  ${primary}
) ${engineEncode}`)

// 게시판별 카테고리들 관리 테이블
tables.push(`${create} ${prefix}board_category (
  ${uid},
  board_uid INT(11) ${unnd0},
  name VARCHAR(20) ${nnde},
  ${primary},
  KEY (board_uid)
) ${engineEncode}`)

// 포인트 사용 이력 보관 테이블 (action = 0 view / 1 write / 2 comment / 3 download)
tables.push(`${create} ${prefix}point_history (
  ${uid},
  user_uid INT(11) ${unnd0},
  board_uid INT(11) ${unnd0},
  action TINYINT(1) ${unnd0},
  point INT(11) ${nnd0},
  ${primary},
  KEY (user_uid)
) ${engineEncode}`)

// 게시글 보관 테이블
tables.push(`${create} ${prefix}post (
  ${uid},
  board_uid INT(11) ${unnd0},
  user_uid INT(11) ${unnd0},
  category_uid INT(11) ${unnd0},
  title VARCHAR(300) ${nnde},
  content VARCHAR(10000) ${nnde},
  submitted BIGINT(14) ${unnd0},
  modified BIGINT(14) ${unnd0},
  ${primary},
  KEY (board_uid),
  KEY (user_uid),
  KEY (category_uid)
) ${engineEncode}`)

// 게시글과 해시태그들의 연관성 정보 보관 테이블
tables.push(`${create} ${prefix}post_hashtag (
  post_uid INT(11) ${unnd0},
  hashtag_uid INT(11) ${unnd0},
  KEY (post_uid),
  KEY (hashtag_uid)
) ${engineEncode}`)

// 해시태그 테이블
tables.push(`${create} ${prefix}hashtag (
  ${uid},
  name VARCHAR(20) ${nnde},
  used INT(11) ${unnd0},
  timestamp BIGINT(14) ${unnd0},
  ${primary}
) ${engineEncode}`)

// 게시글에 대해 사용자마다 좋아요를 눌렀는지 상태 저장
tables.push(`${create} ${prefix}post_like (
  post_uid INT(11) ${unnd0},
  user_uid INT(11) ${unnd0},
  liked TINYINT(1) ${unnd0},
  timestamp BIGINT(14) ${unnd0},
  KEY (post_uid),
  KEY (user_uid)
) ${engineEncode}`)

// 댓글 보관 테이블
tables.push(`${create} ${prefix}comment (
  ${uid},
  reply_uid INT(11) ${unnd0},
  post_uid INT(11) ${unnd0},
  user_uid INT(11) ${unnd0},
  content VARCHAR(1000) ${nnde},
  submitted BIGINT(14) ${unnd0},
  modified BIGINT(14) ${unnd0},
  ${primary},
  KEY (reply_uid),
  KEY (post_uid)
) ${engineEncode}`)

// 댓글에 대해 사용자마다 좋아요를 눌렀는지 상태 저장
tables.push(`${create} ${prefix}comment_like (
  comment_uid INT(11) ${unnd0},
  user_uid INT(11) ${unnd0},
  liked TINYINT(1) ${unnd0},
  timestamp BIGINT(14) ${unnd0},
  KEY (comment_uid),
  KEY (user_uid)
) ${engineEncode}`)

// 파일 첨부하기 기능으로 추가한 파일 정보 보관하는 테이블
tables.push(`${create} ${prefix}file (
  ${uid},
  post_uid INT(11) ${unnd0},
  name VARCHAR(100) ${nnde},
  path VARCHAR(300) ${nnde},
  timestamp BIGINT(14) ${unnd0},
  ${primary},
  KEY (post_uid)
) ${engineEncode}`)

// 본문 작성 시 이미지 첨부하기 기능으로 추가한 이미지 정보 보관하는 테이블, 이미지는 1000px 이하로 리사이즈 후 저장됨
tables.push(`${create} ${prefix}image (
  ${uid},
  user_uid INT(11) ${unnd0},
  path VARCHAR(300) ${nnde},
  timestamp BIGINT(14) ${unnd0},
  ${primary},
  KEY (user_uid)
) ${engineEncode}`)

// 알림 정보 저장용 테이블, type = 0 like post / 1 like comment / 2 leave comment / 3 got a new note
tables.push(`${create} ${prefix}notice (
  ${uid},
  to_uid INT(11) ${unnd0},
  from_uid INT(11) ${unnd0},
  type TINYINT(2) ${unnd0},
  post_uid INT(11) ${unnd0},
  comment_uid INT(11) ${unnd0},
  read TINYINT(1) ${unnd0},
  timestamp BIGINT(14) ${unnd0},
  ${primary},
  KEY (to_uid)
) ${engineEncode}`)
