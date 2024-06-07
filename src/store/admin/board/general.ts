/**
 * store/admin/board/general
 *
 * 게시판 관리자 페이지에서 일반 부분에 필요한 상태 및 함수들
 */

import { ref } from "vue"
import { useRoute } from "vue-router"
import { defineStore } from "pinia"
import { edenTreaty } from "@elysiajs/eden"
import type { App } from "../../../../server/index"
import { AdminBoardConfig, AdminPair } from "../../../interface/admin"
import { useAdminStore } from "../common"
import { useAuthStore } from "../../user/auth"
import { GENERAL } from "../../../messages/store/admin/board/general"
import { INIT_BOARD_CONFIG } from "../../../../server/database/admin/board/general/const"
import { TSBOARD } from "../../../../tsboard.config"
import { BOARD_TYPE } from "../../../../server/database/board/const"
import { BoardType } from "../../../interface/board"

export const useAdminBoardGeneralStore = defineStore("adminBoardGeneral", () => {
  const route = useRoute()
  const client = edenTreaty<App>(TSBOARD.API.URI)
  const admin = useAdminStore()
  const auth = useAuthStore()
  const confirmRemoveCategoryDialog = ref<boolean>(false)
  const board = ref<AdminBoardConfig>(INIT_BOARD_CONFIG)
  const boardGroupName = ref<string>("")
  const boardRows = ref<string>("20")
  const boardWidth = ref<string>("1000")
  const boardAddCategory = ref<string>("")
  const boardUseCategory = ref<boolean>(true)
  const boardRemoveCategory = ref<AdminPair>({ uid: 0, name: "" })

  // 게시판 일반 설정 불러오기
  async function loadGeneralConfig(): Promise<void> {
    const response = await client.tsapi.admin.board.general.load.get({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        id: route.params.id as string,
        userUid: auth.user.uid,
      },
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_LOAD_CONFIG} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    board.value = response.data.result.config
    boardRows.value = board.value.rowCount.toString()
    boardWidth.value = board.value.width.toString()
    boardUseCategory.value = board.value.useCategory
    admin.success(GENERAL.LOADED_CONFIG)
  }

  // 그룹 이름 업데이트하기
  function updateGroupName(): void {
    board.value.groups.map((group: AdminPair) => {
      if (group.uid === board.value.groupUid) {
        boardGroupName.value = group.name
      }
    })
  }

  // 그룹 변경하기
  async function changeGroup(group: AdminPair): Promise<void> {
    const response = await client.tsapi.admin.board.general.change.group.patch({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      groupUid: group.uid,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_UPDATE_GROUP} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    board.value.groupUid = group.uid
    admin.success(
      `${board.value.id} ${GENERAL.CHANGED_GROUP1} ${group.name} ${GENERAL.CHANGED_GROUP2}`,
    )
  }

  // 게시판 이름 변경하기
  async function updateName(): Promise<void> {
    const newName = board.value.name.trim()
    if (newName.length < 2) {
      return admin.error(GENERAL.TOO_SHORT_CATEGORY)
    }
    const response = await client.tsapi.admin.board.general.update.name.patch({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      newName,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_UPDATE_BOARD_NAME} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    admin.success(`${GENERAL.CHANGED_NAME1} ${newName} ${GENERAL.CHANGED_NAME2}`)
  }

  // 게시판 설명 변경하기
  async function updateInfo(): Promise<void> {
    const newInfo = board.value.info.trim()
    if (newInfo.length < 2) {
      return admin.error(GENERAL.TOO_SHORT_NAME)
    }
    const response = await client.tsapi.admin.board.general.update.info.patch({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      newInfo,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_UPDATE_BOARD_INFO} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    admin.success(GENERAL.UPDATED_INFO)
  }

  // 게시판 타입 변경하기
  async function changeType(): Promise<void> {
    const response = await client.tsapi.admin.board.general.change.type.patch({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      newType: board.value.type as number,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_CHANGE_TYPE} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    let typeName = "게시판 (board)"
    if (board.value.type === (BOARD_TYPE.GALLERY as BoardType)) {
      typeName = "갤러리 (gallery)"
    } else if (board.value.type === (BOARD_TYPE.BLOG as BoardType)) {
      typeName = "블로그 (blog)"
    }
    admin.success(`${GENERAL.CHANGED_TYPE1} ${typeName} ${GENERAL.CHANGED_TYPE2}`)
  }

  // 한 페이지에 표시할 게시글 개수 변경하기
  async function updateRows(): Promise<void> {
    const newRows = parseInt(boardRows.value)
    if (newRows < 1 || newRows > 100) {
      admin.error(GENERAL.ROWS_LIMITATION)
      boardRows.value = "20"
      return
    }
    const response = await client.tsapi.admin.board.general.update.rows.patch({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      newRows,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_UPDATE_ROWS} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    admin.success(`${newRows} ${GENERAL.UPDATED_ROWS}`)
  }

  // 게시판 최대 너비 지정하기
  async function updateWidth(): Promise<void> {
    const newWidth = parseInt(boardWidth.value)
    if (newWidth < 300 || newWidth > 3000) {
      admin.error(GENERAL.WIDTH_LIMITATION)
      boardWidth.value = "1000"
      return
    }
    const response = await client.tsapi.admin.board.general.update.width.patch({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      newWidth,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_UPDATE_WIDTH} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    admin.success(`${GENERAL.CHANGED_WIDTH1} ${newWidth} ${GENERAL.CHANGED_WIDTH2}`)
  }

  // 카테고리 추가하기
  async function addCategory(): Promise<void> {
    const newCategory = boardAddCategory.value.trim()
    boardAddCategory.value = ""
    if (newCategory.length < 2) {
      return admin.error(GENERAL.TOO_SHORT_CATEGORY)
    }
    const response = await client.tsapi.admin.board.general.add.category.post({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      newCategory,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_ADD_CATEGORY} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    board.value.categories.push({
      uid: response.data.result.categoryUid,
      name: newCategory,
    })
    admin.success(`${newCategory} ${GENERAL.ADDED_CATEGORY}`)
  }

  // 카테고리 삭제 전 확인하기
  function confirmRemoveCategory(uid: number, name: string): void {
    if (board.value.categories.length < 2) {
      return admin.error(GENERAL.REMOVE_LAST_CATEGORY)
    }
    boardRemoveCategory.value.uid = uid
    boardRemoveCategory.value.name = name
    confirmRemoveCategoryDialog.value = true
  }

  // 카테고리 삭제하기
  async function removeCategory(): Promise<void> {
    if (board.value.categories.length < 2) {
      return admin.error(GENERAL.REMOVE_LAST_CATEGORY)
    }
    const response = await client.tsapi.admin.board.general.remove.category.delete({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      categoryUid: boardRemoveCategory.value.uid,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.UNABLE_REMOVE_CATEGORY} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    board.value.categories = board.value.categories.filter((cat: AdminPair) => {
      return cat.uid !== boardRemoveCategory.value.uid
    })
    admin.success(GENERAL.REMOVED_CATEGORY)
  }

  // 카테고리 사용 여부 설정하기
  async function useCategory(): Promise<void> {
    const response = await client.tsapi.admin.board.general.use.category.patch({
      $headers: {
        authorization: auth.user.token,
      },
      $query: {
        userUid: auth.user.uid,
      },
      boardUid: board.value.uid,
      useCategory: boardUseCategory.value === true ? 0 : 1,
    })

    if (!response.data) {
      return admin.error(GENERAL.NO_RESPONSE)
    }
    if (response.data.success === false) {
      return admin.error(`${GENERAL.FAILED_CHANGE_USE_CATEGORY} (${response.data.error})`)
    }
    auth.updateUserToken(response.data.result.newAccessToken)
    admin.success(GENERAL.CHANGED_USE_CATEGORY)
  }

  return {
    board,
    boardGroupName,
    boardRows,
    boardWidth,
    boardAddCategory,
    boardUseCategory,
    boardRemoveCategory,
    confirmRemoveCategoryDialog,
    loadGeneralConfig,
    updateGroupName,
    changeGroup,
    updateName,
    updateInfo,
    changeType,
    updateRows,
    updateWidth,
    addCategory,
    confirmRemoveCategory,
    removeCategory,
    useCategory,
  }
})
