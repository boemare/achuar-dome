import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  PatternLock: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  Map: undefined;
  Chat: undefined;
  Gallery: undefined;
};

export type GalleryStackParamList = {
  GalleryGrid: undefined;
  MediaDetail: { mediaId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
