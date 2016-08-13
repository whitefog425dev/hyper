import { hterm, lib } from 'hterm-umdjs';

hterm.defaultStorage = new lib.Storage.Memory();

//  clear selection range of current selected term view
//  Fix event when terminal text is selected and keyboard action is invoked
hterm.Terminal.prototype.clearSelection = function () {
  this.document_.getSelection().removeAllRanges();
};

// override double click behavior to copy
const oldMouse = hterm.Terminal.prototype.onMouse_;
hterm.Terminal.prototype.onMouse_ = function (e) {
  if ('dblclick' === e.type) {
    console.log('[hyperterm+hterm] ignore double click');
    return;
  }
  return oldMouse.call(this, e);
};

// there's no option to turn off the size overlay
hterm.Terminal.prototype.overlaySize = function () {};

// fixing a bug in hterm where a double click triggers
// a non-collapsed selection whose text is '', and results
// in an infinite copy loop
hterm.Terminal.prototype.copySelectionToClipboard = function () {
  var text = this.getSelectionText();
  if (text != null && text !== '') {
    this.copyStringToClipboard(text);
  }
};

// passthrough all the commands that are meant to control
// hyperterm and not the terminal itself
const oldKeyDown = hterm.Keyboard.prototype.onKeyDown_;
hterm.Keyboard.prototype.onKeyDown_ = function (e) {
  /**
   * Add fixes for U.S. International PC Keyboard layout
   * These keys are sent through as 'Dead' keys, as they're used as modifiers.
   * Ignore that and insert the correct character.
   */
  if (e.key === 'Dead') {
    if (e.code === 'Quote' && e.shiftKey === false) {
      this.terminal.onVTKeystroke("'");
      return;
    }
    if (e.code === 'Quote' && e.shiftKey === true) {
      this.terminal.onVTKeystroke('"');
      return;
    }
    if ((e.code === 'IntlBackslash' || e.code === 'Backquote') && e.shiftKey === true) {
      this.terminal.onVTKeystroke('~');
      return;
    }
    // This key is also a tilde on all tested keyboards
    if (e.code === 'KeyN' && e.altKey === true) {
      this.terminal.onVTKeystroke('~');
      return;
    }
    if ((e.code === 'IntlBackslash' || e.code === 'Backquote') && e.shiftKey === false) {
      this.terminal.onVTKeystroke('`');
      return;
    }
    if (e.code === 'Digit6') {
      this.terminal.onVTKeystroke('^');
      return;
    }
    // German keyboard layout
    if (e.code === 'Equal' && e.shiftKey === false) {
      this.terminal.onVTKeystroke('´');
      return;
    }
    if (e.code === 'Equal' && e.shiftKey === true) {
      this.terminal.onVTKeystroke('`');
      return;
    }
    // Italian keyboard layout
    if (e.code === 'Digit9' && e.altKey === true) {
      this.terminal.onVTKeystroke('`');
      return;
    }
    if (e.code === 'Digit8' && e.altKey === true) {
      this.terminal.onVTKeystroke('´');
      // To fix issue with changing the terminal prompt
      e.preventDefault();
      return;
    }
    console.warn('Uncaught dead key on international keyboard', e);
  }

  if (e.metaKey || e.altKey) {
    return;
  } else {
    //  Test for valid keys in order to clear the terminal selection
    if ((!e.ctrlKey || e.code !== 'ControlLeft') && !e.shiftKey && e.code !== 'CapsLock') {
      this.terminal.clearSelection();
    }
  }
  return oldKeyDown.call(this, e);
};

const oldKeyPress = hterm.Keyboard.prototype.onKeyPress_;
hterm.Keyboard.prototype.onKeyPress_ = function (e) {
  if (e.metaKey) {
    return;
  } else {
    this.terminal.clearSelection();
  }
  return oldKeyPress.call(this, e);
};

// we re-implement `wipeContents` to preserve the line
// and cursor position that the client is in.
// otherwise the user ends up with a completely clear
// screen which is really strange
hterm.Terminal.prototype.clearPreserveCursorRow = function () {
  this.scrollbackRows_.length = 0;
  this.scrollPort_.resetCache();

  [this.primaryScreen_, this.alternateScreen_].forEach((screen) => {
    const bottom = screen.getHeight();
    if (bottom > 0) {
      this.renumberRows_(0, bottom);

      const x = screen.cursorPosition.column;
      const y = screen.cursorPosition.row;

      if (x === 0) {
        // Empty screen, nothing to do.
        return;
      }

      // here we move the row that the user was focused on
      // to the top of the screen
      this.moveRows_(y, 1, 0);

      for (let i = 1; i < bottom; i++) {
        screen.setCursorPosition(i, 0);
        screen.clearCursorRow();
      }

      // we restore the cursor position
      screen.setCursorPosition(0, x);
    }
  });

  this.syncCursorPosition_();
  this.scrollPort_.invalidate();

  // this will avoid a bug where the `wipeContents`
  // hterm API doesn't send the scroll to the top
  this.scrollPort_.redraw_();
};

// fixes a bug in hterm, where the shorthand hex
// is not properly converted to rgb
lib.colors.hexToRGB = function (arg) {
  var hex16 = lib.colors.re_.hex16;
  var hex24 = lib.colors.re_.hex24;

  function convert (hex) {
    if (hex.length === 4) {
      hex = hex.replace(hex16, function (h, r, g, b) {
        return '#' + r + r + g + g + b + b;
      });
    }
    var ary = hex.match(hex24);
    if (!ary) return null;

    return 'rgb(' +
      parseInt(ary[1], 16) + ', ' +
      parseInt(ary[2], 16) + ', ' +
      parseInt(ary[3], 16) +
    ')';
  }

  if (arg instanceof Array) {
    for (var i = 0; i < arg.length; i++) {
      arg[i] = convert(arg[i]);
    }
  } else {
    arg = convert(arg);
  }

  return arg;
};

export default hterm;
export { lib };
