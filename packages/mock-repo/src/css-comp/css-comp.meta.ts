import CssComp from './css-comp';
import Registry from '@ui-autotools/registry';

const metadata = Registry.getComponentMetadata(CssComp);
metadata.addSim({
    title: 'css_sim',
    props: {
        text: 'You have style'
    }
});

metadata.exportName = 'CssComp';
metadata.compPath = '/cjs/css-comp/css-comp';
metadata.cssPath = '/src/css-comp/css-comp.css';
