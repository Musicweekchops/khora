import { Composition } from "remotion";
import { PromoVideo } from "./PromoVideo";
import { UnirseExplainer } from "./UnirseExplainer";
import { TeacherTour } from "./TeacherTour";
import { DeviceSyncExplainer } from "./DeviceSyncExplainer";
import { TeacherSetupExplainer } from "./TeacherSetupExplainer";
import { ShareLinkExplainer } from "./ShareLinkExplainer";
import { StudentStudyExplainer } from "./StudentStudyExplainer";

export const Root = () => {
  return (
    <>
      <Composition
        id="PromoVideo"
        component={PromoVideo}
        durationInFrames={900} // 30 segundos a 30fps
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="UnirseExplainer"
        component={UnirseExplainer}
        durationInFrames={900} // 30 segundos a 30fps
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TeacherTour"
        component={TeacherTour}
        durationInFrames={900} // 30 segundos a 30fps
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DeviceSync"
        component={DeviceSyncExplainer}
        durationInFrames={900} // 30 segundos a 30fps
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TeacherSetup"
        component={TeacherSetupExplainer}
        durationInFrames={600} // 20 segundos a 30fps
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShareLink"
        component={ShareLinkExplainer}
        durationInFrames={600} // 20 segundos a 30fps
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="StudentStudy"
        component={StudentStudyExplainer}
        durationInFrames={600} // 20 segundos a 30fps
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
