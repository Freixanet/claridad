import { View } from 'react-native';

import SectionBlock, { type SectionData } from '@/components/SectionBlock';
import { useClaridadMotion } from '@/motion/useClaridadMotion';

type Props = {
  sections: SectionData[];
  animateEntrance?: boolean;
};

export default function OrganizedSectionList({ sections, animateEntrance = false }: Props) {
  const { sectionEntering } = useClaridadMotion();

  return (
    <View style={{ gap: 12 }}>
      {sections.map((section, index) => (
        <SectionBlock
          key={section.id || String(index)}
          section={section}
          index={index}
          entering={animateEntrance ? sectionEntering(index) : undefined}
        />
      ))}
    </View>
  );
}
