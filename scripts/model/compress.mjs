import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { weld, draco, prune } from "@gltf-transform/functions";
import codec from "draco3dgltf";
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.encoder": await codec.createEncoderModule({}),
    "draco3d.decoder": await codec.createDecoderModule({}),
  });
const doc = await io.read(process.argv[2]);
await doc.transform(
  weld(),
  prune(),
  draco({
    quantizePosition: 15,
    quantizeNormal: 11,
    encodeSpeed: 4,
    decodeSpeed: 5,
  }),
);
await io.write(process.argv[3], doc);
const checked = await io.read(process.argv[3]);
const root = checked.getRoot();
console.log(
  root.listMeshes().length,
  root
    .listMaterials()
    .map((m) => m.getName())
    .join(", "),
);
