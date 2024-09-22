import { resolve } from "path";

export default {
    plugins: [
      {
        name: 'virtual-modules',
        resolveId(id: any) {
          if (id === '$app/forms') {
            return 'virtual:$app/forms';
          }
        }
      }
    ],
    test: {
      alias: {
        '$app/forms': resolve('./mocks/forms.js')
      }
    }
  };