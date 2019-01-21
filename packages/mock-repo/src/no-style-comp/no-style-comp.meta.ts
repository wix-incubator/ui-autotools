import NoStyleComp from './no-style-comp';
import Registry from '@ui-autotools/registry';

const metadata = Registry.getComponentMetadata(NoStyleComp);
metadata.addSim({
    title: 'no_style_sim',
    props: {
        text: 'You have no style'
    }
});

metadata.exportName = 'NoStyleComp';
metadata.compPath = '/cjs/no-style-comp/no-style-comp';
