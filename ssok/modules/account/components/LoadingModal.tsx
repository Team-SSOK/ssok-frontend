import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Text } from '@/components/TextProvider';

interface LoadingModalProps {
  visible: boolean;
  onFinish: () => void;
}

const { width } = Dimensions.get('window');

export default function LoadingModal({ visible, onFinish }: LoadingModalProps) {
  // 빈 비디오 플레이어 생성
  const videoPlayer = useVideoPlayer(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (visible) {
      // 비동기적으로 비디오 소스 로드
      const loadVideo = async () => {
        videoPlayer.loop = true;
        await videoPlayer.replaceAsync(
          require('@/modules/account/assets/videos/search.mp4'),
        );
        videoPlayer.play();
      };

      loadVideo();

      timer = setTimeout(() => {
        onFinish();
      }, 3000);
    } else {
      videoPlayer.pause();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, onFinish, videoPlayer]);

  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={styles.dialogContent}
        style={styles.dialog}
      >
        <View style={styles.contentContainer}>
          <VideoView
            player={videoPlayer}
            style={styles.video}
            nativeControls={false}
            pointerEvents="none"
          />
          <Text style={styles.loadingText}>계좌 불러오는 중...</Text>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: width * 0.8,
    alignSelf: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
