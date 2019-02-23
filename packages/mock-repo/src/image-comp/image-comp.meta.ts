import ImageComp from './image-comp';
import Registry from '@ui-autotools/registry';
import {mockRepoPluginMetaKey} from '../../.autotools/plugins/mock-repo-plugin-meta-key';

const metadata = Registry.getComponentMetadata(ImageComp);

metadata.addCustomField(mockRepoPluginMetaKey, {
    compPath: 'cjs/src/image-comp/image-comp',
});

metadata.exportInfo = {
    path: 'src/image-comp/image-comp.tsx',
    exportName: 'ImageComp'
};

metadata.staticResources = [
    {
        path: 'src/image-comp/image-comp.css',
        url: 'image-comp.css',
        mimeType: 'text/css'
    }
];

metadata.addSim({
    title: 'image_sim',
    props: {
        src: 'test-image.jpg'
    },
    staticResources: [
        {
            mimeType: 'image/jpeg',
            url: 'test-image.jpg',
            path: 'src/image-comp/test-image.jpg'
        }
    ]
});
