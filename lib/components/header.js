import React from 'react';

import Component from '../component';
import {decorate, getTabsProps} from '../utils/plugins';

import Tabs_ from './tabs';

const Tabs = decorate(Tabs_, 'Tabs');

export default class Header extends Component {

  constructor() {
    super();
    this.onChangeIntent = this.onChangeIntent.bind(this);
    this.handleHeaderClick = this.handleHeaderClick.bind(this);
    this.handleHeaderMouseDown = this.handleHeaderMouseDown.bind(this);
  }

  onChangeIntent(active) {
    // we ignore clicks if they're a byproduct of a drag
    // motion to move the window
    if (window.screenX !== this.headerMouseDownWindowX ||
        window.screenY !== this.headerMouseDownWindowY) {
      return;
    }

    this.props.onChangeTab(active);
  }

  handleHeaderMouseDown(ev) {
    // the hack of all hacks, this prevents the term
    // iframe from losing focus, for example, when
    // the user drags the nav around
    ev.preventDefault();

    // persist start positions of a potential drag motion
    // to differentiate dragging from clicking
    this.headerMouseDownWindowX = window.screenX;
    this.headerMouseDownWindowY = window.screenY;
  }

  handleHeaderClick(event) {
    this.clicks = this.clicks || 0;

    // Reset clicks if mouse moved between clicks
    if (this.headerClickPointerX !== event.clientX ||
        this.headerClickPointerY !== event.clientY) {
      this.clicks = 0;
      clearTimeout(this.clickTimer);

      this.headerClickPointerX = event.clientX;
      this.headerClickPointerY = event.clientY;
    }
    if (++this.clicks === 2) {
      if (this.props.maximized) {
        this.props.unmaximize();
      } else {
        this.props.maximize();
      }
      this.clicks = 0;
      clearTimeout(this.clickTimer);
    } else {
      // http://www.quirksmode.org/dom/events/click.html
      // https://en.wikipedia.org/wiki/Double-click
      this.clickTimer = setTimeout(() => {
        this.clicks = 0;
      }, 500);
    }
  }

  componentWillUnmount() {
    delete this.clicks;
    clearTimeout(this.clickTimer);
  }

  template(css) {
    const {isMac} = this.props;
    const props = getTabsProps(this.props, {
      tabs: this.props.tabs,
      borderColor: this.props.borderColor,
      onClose: this.props.onCloseTab,
      onChange: this.onChangeIntent
    });
    return (<header
      className={css('header', isMac && 'headerRounded')}
      onClick={this.handleHeaderClick}
      onMouseDown={this.handleHeaderMouseDown}
      >
      { this.props.customChildrenBefore }
      <Tabs {...props}/>
      { this.props.customChildren }
    </header>);
  }

  styles() {
    return {
      header: {
        position: 'fixed',
        top: '1px',
        left: '1px',
        right: '1px',
        zIndex: '100'
      },

      headerRounded: {
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px'
      }
    };
  }

}
