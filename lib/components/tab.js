import React from 'react';
import Component from '../component';

export default class Tab extends Component {
  constructor () {
    super();
    this.hover = this.hover.bind(this);
    this.blur = this.blur.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      hovered: false
    };
  }

  hover () {
    this.setState({ hovered: true });
  }

  blur () {
    this.setState({ hovered: false });
  }

  handleClick (event) {
    const isLeftClick = event.nativeEvent.which === 1;
    const isMiddleClick = event.nativeEvent.which === 2;

    if (isLeftClick) {
      this.props.isActive ? null : this.props.onSelect();
    } else if (isMiddleClick) {
      this.props.onClose();
    }
  }

  template (css) {
    const { isActive, isFirst, isLast, borderColor, hasActivity } = this.props;
    const { hovered } = this.state;

    return <li
      onMouseEnter={ this.hover }
      onMouseLeave={ this.blur }
      onClick={ this.props.onClick }
      style={{ borderColor }}
      className={ css(
        'tab',
        isFirst && 'first',
        isActive && 'active',
        hasActivity && 'hasActivity'
      ) }>
        { this.props.customChildrenBefore }
        <span
          className={ css(
            'text',
            isLast && 'textLast',
            isActive && 'textActive'
          ) }
          onClick={ this.handleClick }>
          <span className={ css('textInner') }>
            { this.props.text }
          </span>
        </span>
        <i
          className={ css(
            'icon',
            hovered && 'iconHovered'
          ) }
          onClick={ this.props.onClose }>
          <svg className={ css('shape') }>
            <use xlinkHref='assets/icons.svg#close'></use>
          </svg>
        </i>
        { this.props.customChildren }
    </li>;
  }

  styles () {
    return {
      tab: {
        color: '#ccc',
        listStyleType: 'none',
        flexGrow: 1,
        position: 'relative',
        ':hover': {
          color: '#ccc'
        }
      },

      first: {
        marginLeft: process.platform === 'darwin' ? 76 : 0
      },

      active: {
        color: '#fff',
        ':before': {
          position: 'absolute',
          content: '" "',
          borderBottom: '1px solid #000',
          display: 'block',
          left: '0px',
          right: '0px',
          bottom: '-1px'
        },
        ':hover': {
          color: '#fff'
        }
      },

      hasActivity: {
        color: '#50E3C2',
        ':hover': {
          color: '#50E3C2'
        }
      },

      text: {
        transition: 'color .2s ease',
        height: '34px',
        display: 'block',
        width: '100%',
        position: 'relative',
        borderLeft: '1px solid transparent',
        borderRight: '1px solid transparent',
        overflow: 'hidden'
      },

      textInner: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        textAlign: 'center'
      },

      textLast: {
        borderRightWidth: 0
      },

      textActive: {
        borderColor: 'inherit'
      },

      icon: {
        transition: `opacity .2s ease, color .2s ease,
          transform .25s ease, background-color .1s ease`,
        pointerEvents: 'none',
        position: 'absolute',
        right: '7px',
        top: '10px',
        display: 'inline-block',
        width: '14px',
        height: '14px',
        borderRadius: '100%',
        color: '#e9e9e9',
        opacity: 0,
        transform: 'scale(.95)',

        ':hover': {
          backgroundColor: 'rgba(255,255,255, .13)',
          color: '#fff'
        },

        ':active': {
          backgroundColor: 'rgba(255,255,255, .1)',
          color: '#909090'
        }
      },

      iconHovered: {
        opacity: 1,
        transform: 'none',
        pointerEvents: 'all'
      },

      shape: {
        position: 'absolute',
        left: '4px',
        top: '4px',
        width: '6px',
        height: '6px',
        verticalAlign: 'middle',
        fill: 'currentColor'
      }
    };
  }

}
