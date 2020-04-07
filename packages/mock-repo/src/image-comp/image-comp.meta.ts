import ImageComp from './image-comp';
import Registry from '@ui-autotools/registry';

const metadata = Registry.getComponentMetadata(ImageComp);

metadata.exportInfo = {
    path: 'src/image-comp/image-comp.tsx',
    exportName: 'ImageComp'
};

metadata.addSim({
    title: 'image_sim',
    props: {
        src: 'test-image.jpg'
    }
});
