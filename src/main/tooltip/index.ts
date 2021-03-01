import { solidColor, hexToRgb } from '../helper';
import { TOOLTIP_DEFAULT_SETTINGS } from '../../shared';
import addNode from './types';

interface TooltipPluginData {
  id: any;
  nodeId: any;
  directions: {
    horizontal: string;
    vertical: string;
  };
}

function createArrow(tooltipFrame, settings, { horizontal, vertical }) {
  if (
    (horizontal === 'CENTER' && vertical === 'CENTER') ||
    ((horizontal === 'LEFT' || horizontal === 'RIGHT') &&
      vertical === 'BOTTOM') ||
    ((horizontal === 'LEFT' || horizontal === 'RIGHT') && vertical === 'TOP')
  ) {
    return;
  }

  const arrowFrame = figma.createFrame();
  const arrow = figma.createRectangle();

  const bg = hexToRgb(settings.backgroundColor);
  const stroke = hexToRgb(settings.strokeColor);

  const STROKE_WIDTH = settings.strokeWidth;
  const ARROW_WIDTH = settings.fontSize + STROKE_WIDTH * 2;
  const ARROW_HEIGHT = settings.fontSize + STROKE_WIDTH * 2;
  const FRAME_WIDTH = ARROW_WIDTH / 2;

  // frame
  arrowFrame.name = 'Arrow';
  arrowFrame.resize(FRAME_WIDTH, ARROW_HEIGHT);
  arrowFrame.x -= FRAME_WIDTH - STROKE_WIDTH;
  arrowFrame.y = tooltipFrame.height / 2 - ARROW_HEIGHT / 2;
  arrowFrame.fills = [];

  // arrow
  arrow.strokeWeight = STROKE_WIDTH;
  arrow.strokeAlign = 'INSIDE';
  arrow.strokes = [].concat(solidColor(stroke.r, stroke.g, stroke.b));
  arrow.resize(ARROW_WIDTH, ARROW_HEIGHT);
  arrow.fills = [].concat(solidColor(bg.r, bg.g, bg.b));
  arrow.x = 0;
  arrow.y = arrowFrame.height / 2;
  arrow.rotation = 45;

  if (horizontal === 'LEFT') {
    arrowFrame.rotation = 180;
    arrowFrame.x += tooltipFrame.width + ARROW_WIDTH - STROKE_WIDTH * 2;
    arrowFrame.y = tooltipFrame.height / 2 + ARROW_HEIGHT / 2;
  }

  if (vertical === 'TOP') {
    arrowFrame.rotation = 90;
    arrowFrame.x = tooltipFrame.width / 2 - ARROW_WIDTH / 2;
    arrowFrame.y = tooltipFrame.height + ARROW_HEIGHT / 2 - STROKE_WIDTH;
  }

  if (vertical === 'BOTTOM') {
    arrowFrame.rotation = -90;
    arrowFrame.x = tooltipFrame.width / 2 + ARROW_WIDTH / 2;
    arrowFrame.y = -(ARROW_HEIGHT / 2 - STROKE_WIDTH);
  }

  arrowFrame.appendChild(arrow);

  return arrowFrame;
}

function getTooltipFrame(node, data): FrameNode {
  let pluginData = tooltipPluginDataByNode(node);
  let tooltipFrame;

  // check if plugin data is available
  if (pluginData) {
    // search tooltip
    tooltipFrame = figma.getNodeById(pluginData.id);

    if (!tooltipFrame) {
      pluginData = null;
    } else {
      // reset content
      try {
        tooltipFrame.children.map((c) => c.remove());
      } catch (e) {}
    }
  }

  if (!tooltipFrame) {
    tooltipFrame = figma.createFrame();
  }
  tooltipFrame.expanded = false;
  tooltipFrame.name = 'Tooltip ' + node.name;
  tooltipFrame.locked = true;
  tooltipFrame.clipsContent = false;
  tooltipFrame.fills = [];

  // set plugin data
  const dataForPlugin = {
    directions: {
      vertical: data.vertical,
      horizontal: data.horizontal,
    },
  };

  node.setPluginData(
    'tooltip',
    JSON.stringify(
      // new
      !pluginData
        ? {
            id: tooltipFrame.id,
            nodeId: node.id,
            ...dataForPlugin,
          }
        : //existing
          {
            ...pluginData,
            ...dataForPlugin,
          }
    )
  );

  return tooltipFrame;
}

export function tooltipPluginDataByNode(node: BaseNode): TooltipPluginData {
  const data = node.getPluginData('tooltip');
  if (!data) {
    return null;
  }
  const parsedData = JSON.parse(data);

  if (parsedData.nodeId === node.id) {
    const tooltipNode = figma.getNodeById(parsedData.id);

    if (!tooltipNode) {
      return null;
    }

    return parsedData;
  }
  return null;
}

export function setTooltip(options: any, specificNode = null) {
  const data = {
    vertical: options.vertical || 'CENTER',
    horizontal: options.horizontal || 'LEFT',
    settings: TOOLTIP_DEFAULT_SETTINGS,
  };

  data.settings = {
    ...data.settings,
    ...options,
  };

  switch (options.position) {
    case 'top':
      data.vertical = 'TOP';
      data.horizontal = 'CENTER';
      break;
    case 'bottom':
      data.vertical = 'BOTTOM';
      data.horizontal = 'CENTER';
      break;
    case 'left':
      data.vertical = 'CENTER';
      data.horizontal = 'LEFT';
      break;
    case 'right':
      data.vertical = 'CENTER';
      data.horizontal = 'RIGHT';
      break;
    default:
      return;
  }

  // check if value is set
  for (const settingKey of Object.keys(TOOLTIP_DEFAULT_SETTINGS)) {
    data.settings[settingKey] =
      typeof options[settingKey] === 'undefined'
        ? TOOLTIP_DEFAULT_SETTINGS[settingKey]
        : options[settingKey];
  }

  figma.clientStorage.setAsync('tooltip-settings', data.settings);

  if (figma.currentPage.selection.length === 1 || specificNode) {
    const node = specificNode || figma.currentPage.selection[0];

    if (
      node.type === 'INSTANCE' ||
      node.type === 'BOOLEAN_OPERATION' ||
      node.type === 'SLICE'
    ) {
      figma.notify('This type of element is not supported');
      return;
    }

    const tooltipFrame = getTooltipFrame(node, data);
    const contentFrame = figma.createFrame();
    tooltipFrame.appendChild(contentFrame);

    // ----
    const bg = hexToRgb(data.settings.backgroundColor);
    const stroke = hexToRgb(data.settings.strokeColor);

    contentFrame.locked = true;

    // auto-layout
    contentFrame.layoutMode = 'VERTICAL';
    contentFrame.cornerRadius = data.settings.cornerRadius;
    contentFrame.paddingTop = data.settings.paddingTopBottom;
    contentFrame.paddingBottom = data.settings.paddingTopBottom;
    contentFrame.paddingLeft = data.settings.paddingLeftRight;
    contentFrame.paddingRight = data.settings.paddingLeftRight;
    contentFrame.itemSpacing = 3;
    contentFrame.counterAxisSizingMode = 'AUTO';

    // background
    contentFrame.backgrounds = [].concat(solidColor(bg.r, bg.g, bg.b));

    // stroke
    contentFrame.strokeAlign = 'INSIDE';
    contentFrame.strokeWeight = data.settings.strokeWidth;
    contentFrame.strokes = [].concat(solidColor(stroke.r, stroke.g, stroke.b));

    //-----

    switch (node.type) {
      case 'GROUP':
      case 'COMPONENT':
      case 'VECTOR':
      case 'STAR':
      case 'LINE':
      case 'ELLIPSE':
      case 'FRAME':
      case 'POLYGON':
      case 'RECTANGLE':
      case 'TEXT':
        addNode(contentFrame, node, data.settings);
        break;
    }

    // ----

    const arrow = createArrow(contentFrame, data.settings, {
      horizontal: data.horizontal,
      vertical: data.vertical,
    });

    if (arrow) {
      tooltipFrame.appendChild(arrow);
    }

    tooltipFrame.resize(contentFrame.width, contentFrame.height);

    // ----
    let x,
      y = 0;
    switch (data.vertical) {
      case 'TOP':
        y = (contentFrame.height + data.settings.distance) * -1;
        break;
      case 'CENTER':
        y = node.height / 2 - contentFrame.height / 2;
        break;
      case 'BOTTOM':
        y = node.height + data.settings.distance;
        break;
    }

    switch (data.horizontal) {
      case 'LEFT':
        x = (contentFrame.width + data.settings.distance) * -1;
        break;
      case 'CENTER':
        x = node.width / 2 - contentFrame.width / 2;
        break;
      case 'RIGHT':
        x = node.width + data.settings.distance;
        break;
    }

    tooltipFrame.effects = [].concat({
      offset: {
        x: tooltipFrame.x,
        y: tooltipFrame.y + 2,
      },
      visible: true,
      blendMode: 'NORMAL',
      type: 'DROP_SHADOW',
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 0.1,
      },
      radius: 4,
    });

    const transformPosition = node.absoluteTransform;

    const xCos = transformPosition[0][0];
    const xSin = transformPosition[0][1];

    const yCos = transformPosition[1][0];
    const ySin = transformPosition[1][1];

    tooltipFrame.relativeTransform = [
      [xCos, xSin, xCos * x + xSin * y + transformPosition[0][2]],
      [yCos, ySin, yCos * x + ySin * y + transformPosition[1][2]],
    ];

    return tooltipFrame;
  } else {
    figma.notify('Please select only one element');
  }
}
