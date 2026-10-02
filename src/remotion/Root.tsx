import { Composition, Folder } from "remotion";
import { LIBRARY } from "../pose/progressions";
import { DEMO, FPS, HERO } from "./compositions";
import { ExerciseScene } from "./ExerciseScene";
import { HeroScene } from "./HeroScene";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Hero" component={HeroScene} fps={FPS} {...HERO} />
    <Folder name="Exercises">
      {Object.values(LIBRARY).map((ex, i) => (
        <Composition
          key={ex.id}
          id={`Exercise-${ex.id}`}
          component={ExerciseScene}
          fps={FPS}
          width={DEMO.width}
          height={DEMO.height}
          durationInFrames={Math.round(ex.seconds * FPS * 3)}
          defaultProps={{ exerciseId: ex.id, figNo: i + 1, hud: true }}
        />
      ))}
    </Folder>
  </>
);
