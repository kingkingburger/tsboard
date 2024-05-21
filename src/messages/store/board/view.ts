/**
 * messages/store/board/view
 *
 * 게시글 보기에 필요한 텍스트들 모음
 */

export const TEXT = [
  /* LANG.KO */ {
    NO_BOARD_ID: "게시판 ID가 올바르지 않습니다. 잘못된 접근입니다.",
    NO_RESPONSE: "서버로부터 응답을 받을 수 없습니다. 관리자에게 문의해 주세요.",
    FAILED_LOAD_POST: "게시글을 가져오지 못했습니다. 볼 수 있는 권한이 없을 수 있습니다.",
    FAILED_DOWNLOAD: "파일을 내려받지 못했습니다. 권한이 없거나 포인트가 부족할 수 있습니다.",
    DOWNLOADED_FILE: "파일을 성공적으로 내려받았습니다. 다운로드 폴더를 확인해보세요.",
    FAILED_REMOVE_POST: "게시글을 삭제하지 못했습니다.",
    REMOVED_POST: "게시글을 삭제하였습니다.",
    FAILED_TITLE: "게시글을 가져오지 못했습니다.",
    FAILED_CONTENT:
      "게시글이 삭제되었거나, 비밀글로 설정되었을 수도 있습니다. (혹은 글 작성자가 접근을 제한했을 수 있습니다.)",
  },
  /* LANG.EN */ {
    NO_BOARD_ID: "The board ID is incorrect. This is an invalid access.",
    NO_RESPONSE: "Unable to receive a response from the server. Please contact the administrator.",
    FAILED_LOAD_POST: "Failed to load the post. You may not have the permission to view it.",
    FAILED_DOWNLOAD:
      "Failed to download the file. You may not have the permission or enough points.",
    DOWNLOADED_FILE:
      "The file has been successfully downloaded. Please check your download folder.",
    FAILED_REMOVE_POST: "Failed to delete the post.",
    REMOVED_POST: "The post has been deleted.",
    FAILED_TITLE: "Failed to retrieve the post.",
    FAILED_CONTENT:
      "The post may have been deleted or set as a private post. (Or the author may have restricted access.)",
  },
  /* LANG.CN */ {
    NO_BOARD_ID: "看板ID不正确。这是一次无效的访问。",
    NO_RESPONSE: "无法收到服务器的响应。请联系管理员。",
    FAILED_LOAD_POST: "加载帖子失败。您可能没有权限查看。",
    FAILED_DOWNLOAD: "文件下载失败。您可能没有权限或积分不足。",
    DOWNLOADED_FILE: "文件已成功下载。请检查您的下载文件夹。",
    FAILED_REMOVE_POST: "删除帖子失败。",
    REMOVED_POST: "帖子已被删除。",
    FAILED_TITLE: "无法获取帖子。",
    FAILED_CONTENT: "帖子可能已被删除或设为秘密帖。 (或者帖子作者可能限制了访问权限。)",
  },
]
Object.freeze(TEXT)
