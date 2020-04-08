import NoStyleComp from './no-style-comp';
import Registry from '@ui-autotools/registry';

const metadata = Registry.getComponentMetadata(NoStyleComp);

metadata.exportInfo = {
    path: 'src/no-style-comp/no-style-comp.tsx',
    exportName: 'NoStyleComp'
};

metadata.addSim({
    title: 'no_style_sim',
    props: {
        text: 'You have no style'
    }
});
