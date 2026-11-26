import SkillTree from "../../components/ui/SkillTree";
import { skillById } from "./catalog";
import { useDemo } from "./store";
import TechnologyMark from "./TechnologyMark";

export default function DemoSkillTree({ path }) {
  const { state } = useDemo();
  return (
    <SkillTree
      roots={path.roots}
      skills={skillById}
      isAssessed={(id) => Boolean(state.evidence[id]?.length)}
      renderMark={(id) => <TechnologyMark technology={id} size="xs" />}
    />
  );
}
