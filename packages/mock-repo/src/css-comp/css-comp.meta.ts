import CssComp from './css-comp';
import Registry from '@ui-autotools/registry';

const metadata = Registry.getComponentMetadata(CssComp);

metadata.exportInfo = {
    path: 'src/css-comp/css-comp.tsx',
    exportName: 'CssComp'
};

metadata.addSim({
    title: 'css_sim',
    props: {
        text: 'You have style'
    }
});
