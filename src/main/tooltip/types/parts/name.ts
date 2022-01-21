import { createTooltipTextNode } from '../../../helper';

export default function name(node, parent, { fontColor = '', fontSize = 0 }) {
  if (!node.name) return;

  const iconNode = figma.createNodeFromSvg(
    `  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="https://www.w3.org/2000/svg"><path d="M6.29927 8.32862C6.13412 8.32862 6 8.18506 6 8.0083C6 7.83154 6.13412 7.68799 6.29927 7.68799H7.68978V4.10105C7.6469 3.65866 7.52007 3.33054 7.32664 3.09909C7.11679 2.84713 6.81843 2.69967 6.45712 2.6362C6.29471 2.60788 6.18431 2.44381 6.21077 2.26901C6.23723 2.09518 6.39051 1.97701 6.55383 2.00533C7.04745 2.09225 7.46442 2.30514 7.77099 2.67331C7.84945 2.76706 7.91971 2.87057 7.98175 2.98288C8.06022 2.83737 8.15328 2.70944 8.26004 2.59616C8.58029 2.25631 9.00912 2.07076 9.52099 2.0024C9.68522 1.98092 9.83394 2.10592 9.85401 2.2817C9.87409 2.45748 9.7573 2.61666 9.59307 2.63815C9.20985 2.68893 8.89872 2.81784 8.68066 3.04928C8.46442 3.27878 8.32755 3.62058 8.28832 4.10203V7.68701H9.70073C9.86588 7.68701 10 7.83057 10 8.00732C10 8.18408 9.86588 8.32764 9.70073 8.32764H8.28832V11.898C8.32755 12.3794 8.46442 12.7222 8.68066 12.9507C8.89872 13.1812 9.20985 13.3111 9.59307 13.3619C9.7573 13.3833 9.87409 13.5435 9.85401 13.7183C9.83394 13.8941 9.68522 14.0191 9.52099 13.9976C9.00912 13.9292 8.58029 13.7437 8.26004 13.4038C8.15328 13.2906 8.06022 13.1626 7.98175 13.0171C7.91971 13.1304 7.84945 13.2329 7.77099 13.3267C7.4635 13.6949 7.04653 13.9078 6.55383 13.9947C6.39142 14.023 6.23814 13.9048 6.21077 13.731C6.18431 13.5572 6.29471 13.3931 6.45712 13.3638C6.81843 13.3003 7.11679 13.1529 7.32664 12.9009C7.52007 12.6695 7.6469 12.3404 7.68978 11.899V8.32862H6.29927Z" fill="black" fill-opacity="0.3"/></svg>`
  );
  const textNode = createTooltipTextNode({
    fontColor,
    fontSize,
  });
  textNode.x += 20;
  textNode.y += 1.5;
  textNode.characters = node.name;

  const g = figma.group([iconNode, textNode], parent);
  g.expanded = false;
}
