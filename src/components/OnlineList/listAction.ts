import { LIST_IDS } from '@/config/constant'
import { addListMusics } from '@/core/list'
import { playList, playNext } from '@/core/player/player'
import { addTempPlayList } from '@/core/player/tempPlayList'
import settingState from '@/store/setting/state'
import { getListMusicSync } from '@/utils/listManage'
import { confirmDialog, openUrl, shareMusic, toast, requestStoragePermission } from '@/utils/tools'
import { addDislikeInfo, hasDislike } from '@/core/dislikeList'
import playerState from '@/store/player/state'
import musicSdk from '@/utils/musicSdk'
import { toOldMusicInfo } from '@/utils'
import { getMusicUrl } from '@/core/music'
import { downloadFile, mkdir, musicDirectoryPath } from '@/utils/fs'

export const handlePlay = (musicInfo: LX.Music.MusicInfoOnline) => {
  void addListMusics(LIST_IDS.DEFAULT, [musicInfo], settingState.setting['list.addMusicLocationType']).then(() => {
    const index = getListMusicSync(LIST_IDS.DEFAULT).findIndex(m => m.id == musicInfo.id)
    if (index < 0) return
    void playList(LIST_IDS.DEFAULT, index)
  })
}
export const handlePlayLater = (musicInfo: LX.Music.MusicInfoOnline, selectedList: LX.Music.MusicInfoOnline[], onCancelSelect: () => void) => {
  if (selectedList.length) {
    addTempPlayList(selectedList.map(s => ({ listId: '', musicInfo: s })))
    onCancelSelect()
  } else {
    addTempPlayList([{ listId: '', musicInfo }])
  }
}


export const handleShare = (musicInfo: LX.Music.MusicInfoOnline) => {
  shareMusic(settingState.setting['common.shareType'], settingState.setting['download.fileName'], musicInfo)
}

export const handleShowMusicSourceDetail = async(minfo: LX.Music.MusicInfoOnline) => {
  const url = musicSdk[minfo.source as LX.OnlineSource]?.getMusicDetailPageUrl(toOldMusicInfo(minfo))
  if (!url) return
  void openUrl(url)
}


export const handleDislikeMusic = async(musicInfo: LX.Music.MusicInfoOnline) => {
  const confirm = await confirmDialog({
    message: musicInfo.singer ? global.i18n.t('lists_dislike_music_singer_tip', { name: musicInfo.name, singer: musicInfo.singer }) : global.i18n.t('lists_dislike_music_tip', { name: musicInfo.name }),
    cancelButtonText: global.i18n.t('cancel_button_text_2'),
    confirmButtonText: global.i18n.t('confirm_button_text'),
    bgClose: false,
  })
  if (!confirm) return
  await addDislikeInfo([{ name: musicInfo.name, singer: musicInfo.singer }])
  toast(global.i18n.t('lists_dislike_music_add_tip'))
  if (hasDislike(playerState.playMusicInfo.musicInfo)) {
    void playNext(true)
  }
}

export const handleDownloadMusic = async(musicInfo: LX.Music.MusicInfoOnline) => {
  // 检查存储权限
  const hasPermission = await requestStoragePermission()
  if (!hasPermission) {
    toast(global.i18n.t('download_permission_denied'))
    return
  }

  try {
    toast(global.i18n.t('download_start'))

    // 获取音乐URL
    const url = await getMusicUrl({ musicInfo, isRefresh: false })

    if (!url) {
      toast(global.i18n.t('download_failed'))
      return
    }

    // 生成文件名
    const fileName = settingState.setting['download.fileName']
      .replace('歌名', musicInfo.name)
      .replace('歌手', musicInfo.singer)
      .replace(/\s/g, '') + '.mp3'

    // 确保 Music 目录存在
    await mkdir(musicDirectoryPath)

    // 下载路径
    const downloadPath = `${musicDirectoryPath}/${fileName}`

    // 开始下载
    const downloadResult = downloadFile(url, downloadPath, {
      progressInterval: 100,
      progress: (res) => {
        const progress = (res.bytesWritten / res.contentLength) * 100
        if (progress >= 100) {
          toast(global.i18n.t('download_success'))
        }
      },
    })

    const result = await downloadResult.promise

    if (result.statusCode === 200) {
      toast(global.i18n.t('download_success'))
    } else {
      toast(global.i18n.t('download_failed'))
    }
  } catch (error) {
    console.error('Download error:', error)
    toast(global.i18n.t('download_failed'))
  }
}
