import type { TSESTree } from '@typescript-eslint/utils';
import * as path from 'path';
import { createRule } from '../../rule-creator';
import { getNgrxComponentStoreNames, namedExpression } from '../../utils';

export const messageId = 'updaterExplicitReturnType';

type MessageIds = typeof messageId;
type Options = readonly [];

export default createRule<Options, MessageIds>({
  name: path.parse(__filename).name,
  meta: {
    type: 'problem',
    ngrxModule: 'component-store',
    docs: {
      description: '`Updater` should have an explicit return type.',
    },
    schema: [],
    messages: {
      [messageId]:
        '`Updater` should have an explicit return type when using arrow functions: `this.store.updater((state, value): State => {}`.',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const storeNames = getNgrxComponentStoreNames(context);
    const withoutTypeAnnotation = `ArrowFunctionExpression:not([returnType.typeAnnotation])`;
    const selectors = [
      `ClassDeclaration[superClass.name=/Store/] CallExpression[callee.object.type='ThisExpression'][callee.property.name='updater'] > ${withoutTypeAnnotation}`,
      storeNames &&
        `${namedExpression(
          storeNames
        )}[callee.property.name='updater'] > ${withoutTypeAnnotation}`,
    ]
      .filter(Boolean)
      .join(',');

    return {
      [selectors](node: TSESTree.ArrowFunctionExpression) {
        context.report({
          node,
          messageId,
        });
      },
    };
  },
});
