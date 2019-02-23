import NoStyleComp from './no-style-comp';
import Registry from '@ui-autotools/registry';
import {mockRepoPluginMetaKey} from '../../.autotools/plugins/mock-repo-plugin-meta-key';

const metadata = Registry.getComponentMetadata(NoStyleComp);

metadata.addCustomField(mockRepoPluginMetaKey, {
    compPath: 'cjs/src/no-style-comp/no-style-comp',
});

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
