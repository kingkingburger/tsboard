/**
 * store/gallery.ts
 * 
 * 갤러리 동작과 관련한 상태 및 유틸리티 함수들
 */
import { ref } from "vue"
import { useRouter } from "vue-router"
import { defineStore } from "pinia"

export const useGalleryStore = defineStore("gallery", () => {
  const PREFIX = process.env.PREFIX || ""
  const router = useRouter()
  const postUid = ref<number>(0)
  const viewerDialog = ref<boolean>(false)
  const images = ref<string[]>([])
  const videos = ref<string[]>([])
  const position = ref<number>(0)

  // 갤러리 뷰어 다이얼로그 열기
  function open(id: string, no: number): void {
    router.push({name: "galleryOpen", params: {id, no,}})
    postUid.value = no
    viewerDialog.value = true
  }

  return {
    postUid,
    viewerDialog,
    images,
    videos,
    position,
    open,
  }
})