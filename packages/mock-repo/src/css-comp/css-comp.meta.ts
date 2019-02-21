import CssComp from './css-comp';
import Registry from '@ui-autotools/registry';
import {mockRepoPluginMetaKey} from '../../.autotools/plugins/mock-repo-plugin-meta-key';

const metadata = Registry.getComponentMetadata(CssComp);

metadata.exportInfo = {
    path: 'src/css-comp/css-comp.tsx',
    exportName: 'CssComp'
};

metadata.addCustomField(mockRepoPluginMetaKey, {
    compPath: 'cjs/src/css-comp/css-comp',
});

metadata.staticResources = [
    {
        path: 'src/css-comp/css-comp.css',
        url: 'css-comp.css',
        mimeType: 'text/css'
    }
];

metadata.addSim({
    title: 'css_sim',
    props: {
        text: 'You have style'
    }
});
