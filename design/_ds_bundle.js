/* @ds-bundle: {"format":4,"namespace":"PDFinDesignSystem_41a2ca","components":[{"name":"Alert","sourcePath":"components/core/Alert.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Dropzone","sourcePath":"components/tool/Dropzone.jsx"},{"name":"FileCard","sourcePath":"components/tool/FileCard.jsx"},{"name":"LangSwitcher","sourcePath":"components/tool/LangSwitcher.jsx"},{"name":"PrivacyPill","sourcePath":"components/tool/PrivacyPill.jsx"},{"name":"ToolTile","sourcePath":"components/tool/ToolTile.jsx"},{"name":"ContextMenu","sourcePath":"components/workspace/ContextMenu.jsx"},{"name":"DownloadCard","sourcePath":"components/workspace/DownloadCard.jsx"},{"name":"Modal","sourcePath":"components/workspace/Modal.jsx"},{"name":"PageCard","sourcePath":"components/workspace/PageCard.jsx"},{"name":"PageNavigator","sourcePath":"components/workspace/PageNavigator.jsx"},{"name":"Toast","sourcePath":"components/workspace/Toast.jsx"},{"name":"Toolbar","sourcePath":"components/workspace/Toolbar.jsx"},{"name":"ToolbarDivider","sourcePath":"components/workspace/Toolbar.jsx"},{"name":"ZoomControl","sourcePath":"components/workspace/ZoomControl.jsx"}],"sourceHashes":{"components/core/Alert.jsx":"654fde40c724","components/core/Badge.jsx":"b43431aadd5e","components/core/Button.jsx":"feff2cfa4165","components/core/Card.jsx":"c03aa0d66bb8","components/core/IconButton.jsx":"9934ce970a53","components/core/Input.jsx":"c42fe6d117b8","components/core/ProgressBar.jsx":"218aad6159d6","components/core/Select.jsx":"670713e172f4","components/core/Switch.jsx":"a43148b3f7b2","components/tool/Dropzone.jsx":"e504fc4a3c98","components/tool/FileCard.jsx":"aa035f338c89","components/tool/LangSwitcher.jsx":"5b9b42b844ab","components/tool/PrivacyPill.jsx":"5ce2ec77b5af","components/tool/ToolTile.jsx":"0436d4c6f851","components/workspace/ContextMenu.jsx":"6506131401e6","components/workspace/DownloadCard.jsx":"e263f170935f","components/workspace/Modal.jsx":"417aa4b3e875","components/workspace/PageCard.jsx":"793e23016d40","components/workspace/PageNavigator.jsx":"a682a04d6b09","components/workspace/Toast.jsx":"8997f8244380","components/workspace/Toolbar.jsx":"d62c16d0a6b0","components/workspace/ZoomControl.jsx":"0efd68585c73","ui_kits/pdfin-web/Chrome.jsx":"631dc674fef6","ui_kits/pdfin-web/HomeScreen.jsx":"3c749b4c3783","ui_kits/pdfin-web/MergeScreen.jsx":"54bdcfd91fdb","ui_kits/pdfin-web/workspace/app.jsx":"250de9ed8893","ui_kits/pdfin-web/workspace/engine.js":"6c0cddb9f516","ui_kits/pdfin-web/workspace/i18n.js":"2d4ba239313b","ui_kits/pdfin-web/workspace/process.js":"cba7e4bc822f","ui_kits/pdfin-web/workspace/tools-1.jsx":"f9a5521f3a53","ui_kits/pdfin-web/workspace/tools-2.jsx":"c91f7393a883","ui_kits/pdfin-web/workspace/tools-3.jsx":"27c99ea45568","ui_kits/pdfin-web/workspace/ws-shell.jsx":"3183a5f676b6","ui_kits/pdfin-web/workspace/ws-views.jsx":"1a0ba340d208"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PDFinDesignSystem_41a2ca = window.PDFinDesignSystem_41a2ca || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Alert.jsx
try { (() => {
/** Inline alert. tone: info | success | warning | error. */
function Alert({
  tone = "info",
  title,
  children
}) {
  const tones = {
    info: {
      bg: "var(--status-info-bg)",
      fg: "var(--status-info-fg)"
    },
    success: {
      bg: "var(--status-success-bg)",
      fg: "var(--status-success-fg)"
    },
    warning: {
      bg: "var(--status-warning-bg)",
      fg: "var(--status-warning-fg)"
    },
    error: {
      bg: "var(--status-error-bg)",
      fg: "var(--status-error-fg)"
    }
  };
  const t = tones[tone];
  const icons = {
    info: /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }),
    success: /*#__PURE__*/React.createElement("path", {
      d: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3"
    }),
    warning: /*#__PURE__*/React.createElement("path", {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3zM12 9v4m0 4h.01"
    }),
    error: /*#__PURE__*/React.createElement("path", {
      d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3 7-6 6m0-6 6 6"
    })
  };
  return /*#__PURE__*/React.createElement("div", {
    role: tone === "error" ? "alert" : "status",
    style: {
      display: "flex",
      gap: 10,
      padding: "12px 14px",
      borderRadius: "var(--radius-md)",
      background: t.bg,
      color: t.fg
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flex: "none",
      marginTop: 1
    }
  }, icons[tone]), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-body-sm)"
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-label)",
      marginBottom: 2
    }
  }, title), children));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Alert.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
/** Small status badge. tone: neutral | brand | success | warning | error | info. */
function Badge({
  tone = "neutral",
  children
}) {
  const tones = {
    neutral: {
      background: "var(--surface-sunken)",
      color: "var(--text-muted)"
    },
    brand: {
      background: "var(--surface-brand-subtle)",
      color: "var(--text-brand)"
    },
    success: {
      background: "var(--status-success-bg)",
      color: "var(--status-success-fg)"
    },
    warning: {
      background: "var(--status-warning-bg)",
      color: "var(--status-warning-fg)"
    },
    error: {
      background: "var(--status-error-bg)",
      color: "var(--status-error-fg)"
    },
    info: {
      background: "var(--status-info-bg)",
      color: "var(--status-info-fg)"
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 10px",
      borderRadius: "var(--radius-pill)",
      font: "var(--type-caption)",
      ...tones[tone]
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * PDFin button. variant: primary | secondary | ghost | danger; size: sm | md | lg.
 */
function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  icon = null,
  children,
  onClick,
  type = "button",
  ...rest
}) {
  const [state, setState] = React.useState("idle");
  const base = {
    display: fullWidth ? "flex" : "inline-flex",
    width: fullWidth ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-semibold)",
    letterSpacing: 0,
    border: "1px solid transparent",
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
    whiteSpace: "nowrap"
  };
  const sizes = {
    sm: {
      padding: "6px 12px",
      fontSize: "var(--text-sm)"
    },
    md: {
      padding: "9px 18px",
      fontSize: "var(--text-base)"
    },
    lg: {
      padding: "13px 26px",
      fontSize: "var(--text-md)"
    }
  };
  const active = !disabled && state === "active";
  const hover = !disabled && (state === "hover" || active);
  const variants = {
    primary: {
      background: active ? "var(--action-primary-active)" : hover ? "var(--action-primary-hover)" : "var(--action-primary)",
      color: "var(--text-inverse)"
    },
    secondary: {
      background: hover ? "var(--surface-brand-subtle)" : "var(--surface-card)",
      color: "var(--text-brand)",
      borderColor: hover ? "var(--border-brand)" : "var(--border-default)"
    },
    ghost: {
      background: hover ? "var(--surface-sunken)" : "transparent",
      color: "var(--text-body)"
    },
    danger: {
      background: hover ? "var(--red-700)" : "var(--red-600)",
      color: "var(--text-inverse)"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant]
    },
    onMouseEnter: () => setState("hover"),
    onMouseLeave: () => setState("idle"),
    onMouseDown: () => setState("active"),
    onMouseUp: () => setState("hover")
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
/** Surface card. padded by default; raised adds stronger shadow. */
function Card({
  raised = false,
  padding = "var(--space-6)",
  style = {},
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: raised ? "var(--shadow-raised)" : "var(--shadow-card)",
      padding,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Icon-only button with accessible name. variant: ghost | outline. */
function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  disabled = false,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const dim = size === "sm" ? 32 : 40;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: dim,
      height: dim,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-md)",
      border: variant === "outline" ? "1px solid var(--border-default)" : "1px solid transparent",
      background: hover && !disabled ? "var(--surface-sunken)" : variant === "outline" ? "var(--surface-card)" : "transparent",
      color: "var(--text-body)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "background var(--duration-fast) var(--ease-out)"
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Text input with label + optional error, mono option for technical values. */
function Input({
  label,
  id,
  error,
  hint,
  mono = false,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      font: "var(--type-label)",
      color: "var(--text-heading)"
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    "aria-invalid": !!error,
    "aria-describedby": error && inputId ? inputId + "-error" : undefined,
    style: {
      padding: "9px 12px",
      borderRadius: "var(--radius-md)",
      border: "1px solid " + (error ? "var(--red-600)" : focus ? "var(--border-focus)" : "var(--border-default)"),
      background: "var(--surface-card)",
      color: "var(--text-heading)",
      font: mono ? "var(--type-mono)" : "var(--type-body)",
      outline: "none",
      boxShadow: focus ? "var(--shadow-focus)" : "none",
      transition: "border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)"
    }
  }, rest)), error ? /*#__PURE__*/React.createElement("span", {
    id: inputId ? inputId + "-error" : undefined,
    style: {
      font: "var(--type-caption)",
      color: "var(--status-error-fg)"
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressBar.jsx
try { (() => {
/** Determinate progress bar, announced to screen readers. */
function ProgressBar({
  value = 0,
  label
}) {
  const pct = Math.max(0, Math.min(100, value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, Math.round(pct), "%")), /*#__PURE__*/React.createElement("div", {
    role: "progressbar",
    "aria-valuenow": Math.round(pct),
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-label": label,
    style: {
      height: 8,
      borderRadius: 999,
      background: "var(--surface-sunken)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      borderRadius: 999,
      background: "var(--gradient-brand)",
      transition: "width var(--duration-base) linear"
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Labeled native select. options: [{value, label}]. */
function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  ...rest
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selectId,
    style: {
      font: "var(--type-label)",
      color: "var(--text-heading)"
    }
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    id: selectId,
    value: value,
    onChange: onChange,
    style: {
      padding: "9px 12px",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-default)",
      background: "var(--surface-card)",
      color: "var(--text-heading)",
      font: "var(--type-body)",
      cursor: "pointer"
    }
  }, rest), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
/** Toggle switch with label. */
function Switch({
  label,
  checked = false,
  onChange,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => onChange && onChange(!checked),
    style: {
      width: 40,
      height: 24,
      borderRadius: 999,
      border: "1px solid " + (checked ? "var(--action-primary)" : "var(--border-strong)"),
      background: checked ? "var(--action-primary)" : "var(--surface-sunken)",
      position: "relative",
      cursor: "inherit",
      padding: 0,
      transition: "background var(--duration-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: checked ? 18 : 2,
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(27,23,48,.25)",
      transition: "left var(--duration-base) var(--ease-out)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-body)"
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/tool/Dropzone.jsx
try { (() => {
/** File drop zone — dashed border, keyboard-accessible button fallback. */
function Dropzone({
  lang = "id",
  multiple = false,
  accept = "PDF",
  onSelect,
  compact = false
}) {
  const [over, setOver] = React.useState(false);
  const t = lang === "id" ? {
    drop: "Letakkan file di sini",
    or: "atau",
    choose: "Pilih file",
    hint: "Format " + accept + (multiple ? " · beberapa file" : "")
  } : {
    drop: "Drop files here",
    or: "or",
    choose: "Choose file",
    hint: accept + " format" + (multiple ? " · multiple files" : "")
  };
  return /*#__PURE__*/React.createElement("div", {
    onDragOver: e => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: e => {
      e.preventDefault();
      setOver(false);
      onSelect && onSelect(e);
    },
    style: {
      border: "2px dashed " + (over ? "var(--border-focus)" : "var(--border-strong)"),
      background: over ? "var(--surface-brand-subtle)" : "var(--surface-card)",
      borderRadius: "var(--radius-xl)",
      padding: compact ? "24px 20px" : "48px 32px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      textAlign: "center",
      transition: "border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: "var(--radius-lg)",
      background: "var(--surface-brand-subtle)",
      color: "var(--text-brand)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-h4)",
      color: "var(--text-heading)"
    }
  }, t.drop), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-faint)"
    }
  }, t.or), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSelect && onSelect(),
    style: {
      background: "var(--action-primary)",
      color: "#fff",
      border: 0,
      borderRadius: "var(--radius-md)",
      padding: "9px 20px",
      font: "var(--type-label)",
      fontSize: "var(--text-base)",
      cursor: "pointer"
    }
  }, t.choose), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, t.hint));
}
Object.assign(__ds_scope, { Dropzone });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tool/Dropzone.jsx", error: String((e && e.message) || e) }); }

// components/tool/FileCard.jsx
try { (() => {
/** Uploaded-file card: thumbnail, mono filename, meta, actions. */
function FileCard({
  name,
  meta,
  thumbnail,
  onRemove,
  dragHandle = true,
  removeLabel = "Hapus file"
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "var(--surface-card)",
      border: "1px solid " + (hover ? "var(--border-strong)" : "var(--border-default)"),
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-card)",
      padding: "10px 12px",
      transition: "border-color var(--duration-fast) var(--ease-out)"
    }
  }, dragHandle && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: "var(--text-faint)",
      cursor: "grab",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "5",
    r: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "5",
    r: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "12",
    r: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "12",
    r: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "19",
    r: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "19",
    r: "1.6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 56,
      borderRadius: "var(--radius-sm)",
      flex: "none",
      background: thumbnail ? "url(" + thumbnail + ") center/cover" : "var(--surface-sunken)",
      border: "1px solid var(--border-default)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-faint)"
    }
  }, !thumbnail && /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v6h6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-mono)",
      fontWeight: 500,
      color: "var(--text-heading)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, name), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, meta)), onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": removeLabel,
    title: removeLabel,
    onClick: onRemove,
    style: {
      width: 32,
      height: 32,
      border: 0,
      borderRadius: "var(--radius-sm)",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
  }))));
}
Object.assign(__ds_scope, { FileCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tool/FileCard.jsx", error: String((e && e.message) || e) }); }

// components/tool/LangSwitcher.jsx
try { (() => {
/** Segmented ID/EN language switcher. */
function LangSwitcher({
  lang = "id",
  onChange
}) {
  const opts = ["id", "en"];
  return /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Language",
    style: {
      display: "inline-flex",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-pill)",
      padding: 3,
      gap: 2
    }
  }, opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    type: "button",
    "aria-pressed": lang === o,
    onClick: () => onChange && onChange(o),
    style: {
      border: 0,
      borderRadius: "var(--radius-pill)",
      padding: "5px 12px",
      font: "var(--type-caption)",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      cursor: "pointer",
      background: lang === o ? "var(--surface-card)" : "transparent",
      color: lang === o ? "var(--text-brand)" : "var(--text-muted)",
      boxShadow: lang === o ? "var(--shadow-card)" : "none",
      transition: "background var(--duration-fast) var(--ease-out)"
    }
  }, o)));
}
Object.assign(__ds_scope, { LangSwitcher });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tool/LangSwitcher.jsx", error: String((e && e.message) || e) }); }

// components/tool/PrivacyPill.jsx
try { (() => {
/** Privacy trust pill — the cyan local-processing marker used on every tool page. */
function PrivacyPill({
  lang = "id",
  text
}) {
  const copy = text || (lang === "id" ? "File tetap di perangkat Anda" : "Your files stay on your device");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "var(--privacy-bg)",
      color: "var(--privacy-fg)",
      border: "1px solid var(--privacy-border)",
      borderRadius: "var(--radius-pill)",
      padding: "6px 12px",
      font: "var(--type-caption)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  })), copy);
}
Object.assign(__ds_scope, { PrivacyPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tool/PrivacyPill.jsx", error: String((e && e.message) || e) }); }

// components/tool/ToolTile.jsx
try { (() => {
/** Homepage tool grid tile: icon on violet tile, title, description. */
function ToolTile({
  icon,
  title,
  description,
  href = "#",
  badge
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      height: "100%",
      boxSizing: "border-box",
      background: "var(--surface-card)",
      border: "1px solid " + (hover ? "var(--border-brand)" : "var(--border-default)"),
      borderRadius: "var(--radius-lg)",
      boxShadow: hover ? "var(--shadow-raised)" : "var(--shadow-card)",
      padding: "var(--space-5)",
      textDecoration: "none",
      transition: "box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: "var(--surface-brand-subtle)",
      color: "var(--text-brand)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, icon), badge), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-h4)",
      color: "var(--text-heading)",
      minHeight: "2.6em",
      display: "flex",
      alignItems: "flex-start"
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-muted)"
    }
  }, description)));
}
Object.assign(__ds_scope, { ToolTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tool/ToolTile.jsx", error: String((e && e.message) || e) }); }

// components/workspace/ContextMenu.jsx
try { (() => {
/** Context menu at a fixed position. items: {label, icon?, shortcut?, danger?, onSelect} or "divider". */
function ContextMenu({
  items = [],
  x = 0,
  y = 0,
  onClose
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const away = e => {
      if (ref.current && !ref.current.contains(e.target)) onClose && onClose();
    };
    const key = e => {
      if (e.key === "Escape") onClose && onClose();
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    role: "menu",
    style: {
      position: "fixed",
      left: x,
      top: y,
      zIndex: 120,
      minWidth: 190,
      padding: 5,
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      boxShadow: "0 12px 32px rgba(18, 15, 34, 0.18)",
      display: "flex",
      flexDirection: "column"
    }
  }, items.map((it, i) => it === "divider" ? /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 1,
      background: "var(--border-default)",
      margin: "5px 6px"
    }
  }) : /*#__PURE__*/React.createElement(MenuItem, {
    key: i,
    item: it,
    onClose: onClose
  })));
}
function MenuItem({
  item,
  onClose
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "menuitem",
    disabled: item.disabled,
    onClick: () => {
      item.onSelect && item.onSelect();
      onClose && onClose();
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "7px 9px",
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: hover && !item.disabled ? item.danger ? "var(--status-error-bg)" : "var(--surface-sunken)" : "transparent",
      color: item.danger ? "var(--status-error-fg)" : "var(--text-body)",
      font: "var(--type-body-sm)",
      cursor: item.disabled ? "not-allowed" : "pointer",
      opacity: item.disabled ? 0.45 : 1,
      textAlign: "left",
      width: "100%"
    }
  }, item.icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flex: "none"
    }
  }, item.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, item.label), item.shortcut && /*#__PURE__*/React.createElement("kbd", {
    style: {
      font: "11px var(--font-mono)",
      color: "var(--text-faint)",
      background: "transparent",
      border: "none"
    }
  }, item.shortcut));
}
Object.assign(__ds_scope, { ContextMenu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workspace/ContextMenu.jsx", error: String((e && e.message) || e) }); }

// components/workspace/DownloadCard.jsx
try { (() => {
/** Result file card: success icon, mono filename, meta, primary download action. */
function DownloadCard({
  name,
  meta,
  downloadLabel = "Download",
  onDownload,
  icon = null
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 16px",
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-card)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: "var(--radius-md)",
      background: "var(--status-success-bg)",
      color: "var(--status-success-fg)",
      flex: "none"
    }
  }, icon || /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v6h6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-medium) 13px/1.3 var(--font-mono)",
      color: "var(--text-heading)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, name), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, meta)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDownload,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 16px",
      border: "1px solid transparent",
      borderRadius: "var(--radius-md)",
      background: hover ? "var(--action-primary-hover)" : "var(--action-primary)",
      color: "var(--text-inverse)",
      font: "var(--weight-semibold) var(--text-sm)/1 var(--font-sans)",
      cursor: "pointer",
      flex: "none",
      transition: "background var(--duration-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
  })), downloadLabel));
}
Object.assign(__ds_scope, { DownloadCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workspace/DownloadCard.jsx", error: String((e && e.message) || e) }); }

// components/workspace/Modal.jsx
try { (() => {
/** Modal dialog with overlay, title, body, footer slot. Esc and overlay click close. */
function Modal({
  title,
  children,
  footer = null,
  onClose,
  width = 440
}) {
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    },
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(18, 15, 34, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === "string" ? title : undefined,
    style: {
      width: "100%",
      maxWidth: width,
      maxHeight: "85vh",
      overflow: "auto",
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "0 24px 64px rgba(18, 15, 34, 0.28)",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "18px 20px 0"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--type-h4, var(--weight-bold) 17px/1.3 var(--font-sans))",
      color: "var(--text-heading)",
      margin: 0,
      flex: 1,
      letterSpacing: "-0.01em"
    }
  }, title), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close",
    onClick: onClose,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 30,
      height: 30,
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 20px 18px",
      font: "var(--type-body-sm)",
      color: "var(--text-body)"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      padding: "0 20px 18px"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workspace/Modal.jsx", error: String((e && e.message) || e) }); }

// components/workspace/PageCard.jsx
try { (() => {
/**
 * Card for one PDF page in a grid: thumbnail slot, page number, selection ring,
 * rotation, hover action slot. Selection via click; checkbox appears on hover/selected.
 */
function PageCard({
  pageNumber,
  selected = false,
  rotation = 0,
  children,
  width = 148,
  onClick,
  onContextMenu,
  badge = null,
  actions = null,
  dimmed = false,
  label
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    role: "option",
    "aria-selected": selected,
    "aria-label": label || `Page ${pageNumber}`,
    tabIndex: 0,
    onClick: onClick,
    onContextMenu: onContextMenu,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onKeyDown: e => {
      if ((e.key === "Enter" || e.key === " ") && onClick) {
        e.preventDefault();
        onClick(e);
      }
    },
    style: {
      width,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      cursor: "pointer",
      opacity: dimmed ? 0.35 : 1,
      transition: "opacity var(--duration-fast) var(--ease-out)",
      outline: "none",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "3 / 4",
      background: "var(--surface-card)",
      border: selected ? "2px solid var(--action-primary)" : "1px solid var(--border-default)",
      boxShadow: selected ? "var(--shadow-focus)" : hover ? "var(--shadow-card)" : "none",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: selected ? 0 : 1,
      transition: "box-shadow var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: rotation ? `rotate(${rotation}deg)` : "none",
      transition: "transform var(--duration-base) var(--ease-out)"
    }
  }, children), (hover || selected) && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      top: 6,
      left: 6,
      width: 20,
      height: 20,
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: selected ? "var(--action-primary)" : "var(--surface-card)",
      border: selected ? "none" : "1px solid var(--border-strong)",
      color: "#fff"
    }
  }, selected && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), badge && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 6,
      right: 6
    }
  }, badge), actions && hover && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      bottom: 6,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: 2,
      padding: 2,
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-card)"
    }
  }, actions)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-medium) 11.5px/1 var(--font-mono)",
      color: selected ? "var(--text-brand)" : "var(--text-muted)",
      textAlign: "center"
    }
  }, pageNumber));
}
Object.assign(__ds_scope, { PageCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workspace/PageCard.jsx", error: String((e && e.message) || e) }); }

// components/workspace/PageNavigator.jsx
try { (() => {
/** Page navigator: prev / editable page field of N / next. */
function PageNavigator({
  page = 1,
  count = 1,
  onChange,
  prevLabel = "Previous page",
  nextLabel = "Next page"
}) {
  const [draft, setDraft] = React.useState(null);
  const commit = () => {
    if (draft != null) {
      const n = parseInt(draft, 10);
      if (!isNaN(n)) onChange && onChange(Math.min(count, Math.max(1, n)));
    }
    setDraft(null);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(NavBtn, {
    label: prevLabel,
    disabled: page <= 1,
    onClick: () => onChange && onChange(page - 1),
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m15 18-6-6 6-6"
    }))
  }), /*#__PURE__*/React.createElement("input", {
    "aria-label": "Page",
    value: draft != null ? draft : String(page),
    onChange: e => setDraft(e.target.value.replace(/[^0-9]/g, "")),
    onBlur: commit,
    onKeyDown: e => {
      if (e.key === "Enter") e.target.blur();
    },
    style: {
      width: 38,
      textAlign: "center",
      font: "var(--weight-medium) 12.5px/1.2 var(--font-mono)",
      color: "var(--text-heading)",
      background: "var(--surface-sunken)",
      border: "1px solid transparent",
      borderRadius: "var(--radius-sm)",
      padding: "6px 4px",
      outline: "none"
    },
    onFocus: e => {
      e.target.style.borderColor = "var(--border-focus)";
      e.target.select();
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-medium) 12.5px/1 var(--font-mono)",
      color: "var(--text-muted)"
    }
  }, "/ ", count), /*#__PURE__*/React.createElement(NavBtn, {
    label: nextLabel,
    disabled: page >= count,
    onClick: () => onChange && onChange(page + 1),
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m9 18 6-6-6-6"
    }))
  }));
}
function NavBtn({
  label,
  icon,
  onClick,
  disabled
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: hover && !disabled ? "var(--surface-sunken)" : "transparent",
      color: "var(--text-body)",
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background var(--duration-fast) var(--ease-out)"
    }
  }, icon);
}
Object.assign(__ds_scope, { PageNavigator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workspace/PageNavigator.jsx", error: String((e && e.message) || e) }); }

// components/workspace/Toast.jsx
try { (() => {
const tones = {
  neutral: {
    icon: null,
    color: "var(--text-body)"
  },
  success: {
    color: "var(--status-success-fg)",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m9 11 3 3L22 4"
    }))
  },
  error: {
    color: "var(--status-error-fg)",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m15 9-6 6M9 9l6 6"
    }))
  },
  info: {
    color: "var(--status-info-fg)",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 16v-4M12 8h.01"
    }))
  }
};

/** Transient toast notification. Render inside a fixed bottom-center stack. */
function Toast({
  tone = "neutral",
  children,
  action = null,
  onDismiss
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      background: "var(--surface-inverse)",
      color: "var(--text-inverse)",
      borderRadius: "var(--radius-md)",
      boxShadow: "0 12px 32px rgba(18, 15, 34, 0.3)",
      font: "var(--type-body-sm)",
      maxWidth: 480
    }
  }, t.icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      color: t.color === "var(--text-body)" ? "inherit" : t.color,
      flex: "none"
    }
  }, t.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), action, onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Dismiss",
    onClick: onDismiss,
    style: {
      display: "flex",
      border: "none",
      background: "transparent",
      color: "inherit",
      opacity: 0.7,
      cursor: "pointer",
      padding: 2
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workspace/Toast.jsx", error: String((e && e.message) || e) }); }

// components/workspace/Toolbar.jsx
try { (() => {
/** Floating workspace toolbar: groups IconButtons/controls on a card surface. */
function Toolbar({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "toolbar",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      padding: 4,
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-card)",
      ...style
    }
  }, children);
}

/** Vertical hairline separator between toolbar groups. */
function ToolbarDivider() {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 1,
      height: 20,
      background: "var(--border-default)",
      margin: "0 4px",
      flex: "none"
    }
  });
}
Object.assign(__ds_scope, { Toolbar, ToolbarDivider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workspace/Toolbar.jsx", error: String((e && e.message) || e) }); }

// components/workspace/ZoomControl.jsx
try { (() => {
/** Zoom stepper: minus / mono percent / plus. Click the percent to reset. */
function ZoomControl({
  value = 100,
  onZoomIn,
  onZoomOut,
  onReset,
  min = 25,
  max = 400
}) {
  const btn = (label, icon, onClick, disabled) => /*#__PURE__*/React.createElement(ZoomBtn, {
    label: label,
    icon: icon,
    onClick: onClick,
    disabled: disabled
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2
    }
  }, btn("Zoom out", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  })), onZoomOut, value <= min), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onReset,
    title: "Reset zoom",
    style: {
      font: "var(--weight-medium) 12.5px/1 var(--font-mono)",
      color: "var(--text-body)",
      background: "transparent",
      border: "none",
      borderRadius: "var(--radius-sm)",
      padding: "6px 6px",
      minWidth: 46,
      textAlign: "center",
      cursor: onReset ? "pointer" : "default"
    }
  }, Math.round(value), "%"), btn("Zoom in", /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })), onZoomIn, value >= max));
}
function ZoomBtn({
  label,
  icon,
  onClick,
  disabled
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: hover && !disabled ? "var(--surface-sunken)" : "transparent",
      color: "var(--text-body)",
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background var(--duration-fast) var(--ease-out)"
    }
  }, icon);
}
Object.assign(__ds_scope, { ZoomControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workspace/ZoomControl.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/Chrome.jsx
try { (() => {
// PDFin Web — shared chrome (Header, Footer). Exposes to window.
const DS = window.PDFinDesignSystem_41a2ca;
function PdfinLogo({
  dark = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/pdfin-mark-64.png",
    alt: "",
    style: {
      width: 30,
      height: 30
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-extrabold) 20px/1 var(--font-sans)",
      letterSpacing: "-0.02em",
      color: dark ? "#fff" : "var(--text-heading)"
    }
  }, "PDF", /*#__PURE__*/React.createElement("span", {
    style: {
      color: dark ? "var(--cyan-400)" : "var(--text-brand)"
    }
  }, "in")));
}
function Header({
  lang,
  setLang,
  theme,
  setTheme,
  onHome
}) {
  const nav = lang === "id" ? ["Semua alat", "Desktop", "Tentang"] : ["All tools", "Desktop", "About"];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: "var(--header-height)",
      background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-default)",
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "0 32px",
      position: "sticky",
      top: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onHome();
    },
    style: {
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(PdfinLogo, null)), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 4,
      flex: 1
    }
  }, nav.map(n => /*#__PURE__*/React.createElement("a", {
    key: n,
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      font: "var(--type-label)",
      color: "var(--text-body)",
      padding: "8px 12px",
      borderRadius: "var(--radius-md)",
      textDecoration: "none"
    }
  }, n))), /*#__PURE__*/React.createElement(DS.LangSwitcher, {
    lang: lang,
    onChange: setLang
  }), /*#__PURE__*/React.createElement(DS.IconButton, {
    label: theme === "dark" ? "Light mode" : "Dark mode",
    onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    icon: theme === "dark" ? /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"
    }))
  }));
}
function Footer({
  lang
}) {
  const t = lang === "id" ? {
    privacy: "Kebijakan privasi",
    terms: "Syarat & ketentuan",
    desktop: "Aplikasi desktop",
    note: "File Anda diproses di browser. PDFin tidak mengunggah file Anda untuk alat ini."
  } : {
    privacy: "Privacy policy",
    terms: "Terms",
    desktop: "Desktop app",
    note: "Your files are processed in your browser. PDFin does not upload your files for this tool."
  };
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--border-default)",
      padding: "28px 32px",
      display: "flex",
      alignItems: "center",
      gap: 24,
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement(PdfinLogo, null), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)",
      flex: 1
    }
  }, t.note), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      font: "var(--type-caption)"
    }
  }, t.privacy), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      font: "var(--type-caption)"
    }
  }, t.terms), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      font: "var(--type-caption)"
    }
  }, "GitHub"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      font: "var(--type-caption)"
    }
  }, t.desktop));
}
Object.assign(window, {
  PdfinLogo,
  Header,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/HomeScreen.jsx
try { (() => {
// PDFin Web — homepage screen
const HomeDS = window.PDFinDesignSystem_41a2ca;
const homeIcons = {
  merge: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m18 16 4-4-4-4M6 8l-4 4 4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3v18"
  })),
  split: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M16 21h5v-5M8 21H3v-5M21 21l-7-7M3 21l7-7"
  })),
  organize: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "14",
    width: "7",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "14",
    width: "7",
    height: "7",
    rx: "1"
  })),
  rotate: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 3v5h-5"
  })),
  img2pdf: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "9",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"
  })),
  pdf2img: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v6h6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "13",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m20 21-3.5-3.5a1.5 1.5 0 0 0-2 0L9 23"
  })),
  compress: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m4 4 6 6m0-6v6H4M20 20l-6-6m6 0v6h-6"
  })),
  watermark: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
  })),
  numbers: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 17V7l-2 2M10 7h4l-4 10h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 7h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3"
  })),
  flatten: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m12 2 8.5 4.5L12 11 3.5 6.5 12 2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m3.5 12 8.5 4.5 8.5-4.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m3.5 17.5 8.5 4.5 8.5-4.5"
  }))
};
const homeTools = [{
  key: "merge",
  id: ["Gabung PDF", "Gabungkan beberapa PDF menjadi satu file."],
  en: ["Merge PDF", "Combine multiple PDFs into one file."],
  live: true
}, {
  key: "split",
  id: ["Pisah PDF", "Ambil halaman tertentu dari sebuah PDF."],
  en: ["Split PDF", "Extract selected pages from a PDF."]
}, {
  key: "organize",
  id: ["Atur Halaman PDF", "Urutkan, hapus, dan putar halaman."],
  en: ["Organize PDF", "Reorder, delete, and rotate pages."]
}, {
  key: "rotate",
  id: ["Putar PDF", "Putar semua atau sebagian halaman."],
  en: ["Rotate PDF", "Rotate all or selected pages."]
}, {
  key: "img2pdf",
  id: ["Gambar ke PDF", "Ubah JPG, PNG, WebP menjadi PDF."],
  en: ["Images to PDF", "Turn JPG, PNG, WebP into a PDF."]
}, {
  key: "pdf2img",
  id: ["PDF ke Gambar", "Ekspor halaman PDF sebagai JPG/PNG."],
  en: ["PDF to Image", "Export PDF pages as JPG/PNG."]
}, {
  key: "compress",
  id: ["Kompres PDF", "Kecilkan ukuran file PDF."],
  en: ["Compress PDF", "Reduce PDF file size."]
}, {
  key: "watermark",
  id: ["Watermark PDF", "Tambahkan teks atau logo watermark."],
  en: ["Watermark PDF", "Add a text or logo watermark."]
}, {
  key: "numbers",
  id: ["Tambah Nomor Halaman", "Beri nomor halaman pada PDF."],
  en: ["Page Numbers", "Add page numbers to a PDF."]
}, {
  key: "flatten",
  id: ["Ratakan PDF", "Gabungkan isi PDF menjadi satu lapisan."],
  en: ["Flatten PDF", "Merge PDF content into a single layer."]
}];
function HomeScreen({
  lang,
  onOpenMerge
}) {
  const t = lang === "id" ? {
    h1: "Alat PDF mudah, cepat, dan privat.",
    sub: "File tetap di perangkat Anda. Semua alat inti memproses file langsung di browser — tanpa unggah, tanpa akun.",
    soon: "Segera hadir",
    protect: ["Kunci PDF", "Lindungi PDF dengan kata sandi."]
  } : {
    h1: "PDF tools that keep your files on your device.",
    sub: "All core tools process files directly in your browser — no upload, no account.",
    soon: "Coming soon",
    protect: ["Protect PDF", "Password-protect a PDF."]
  };
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--gradient-brand-soft)",
      borderBottom: "1px solid var(--border-default)",
      padding: "56px 32px 48px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(HomeDS.PrivacyPill, {
    lang: lang
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--type-display)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, t.h1), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body)",
      color: "var(--text-muted)",
      maxWidth: 560,
      margin: 0
    }
  }, t.sub))), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "40px 32px 64px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridAutoRows: "1fr",
      gap: 16
    }
  }, homeTools.map(tool => {
    const [title, desc] = lang === "id" ? tool.id : tool.en;
    return /*#__PURE__*/React.createElement("div", {
      key: tool.key,
      onClick: tool.live ? onOpenMerge : undefined,
      style: {
        cursor: tool.live ? "pointer" : "default",
        height: "100%"
      }
    }, /*#__PURE__*/React.createElement(HomeDS.ToolTile, {
      icon: homeIcons[tool.key],
      title: title,
      description: desc
    }));
  }), /*#__PURE__*/React.createElement(HomeDS.ToolTile, {
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "11",
      width: "18",
      height: "11",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 11V7a5 5 0 0 1 10 0v4"
    })),
    title: t.protect[0],
    description: t.protect[1],
    badge: /*#__PURE__*/React.createElement(HomeDS.Badge, {
      tone: "neutral"
    }, t.soon)
  }))));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/MergeScreen.jsx
try { (() => {
// PDFin Web — Merge PDF tool workspace (interactive mock)
const MergeDS = window.PDFinDesignSystem_41a2ca;
const sampleFiles = [{
  id: 1,
  name: "laporan-keuangan-q2.pdf",
  meta: "2,4 MB · 18 halaman"
}, {
  id: 2,
  name: "lampiran-kontrak.pdf",
  meta: "840 KB · 6 halaman"
}];
function MergeScreen({
  lang
}) {
  const t = lang === "id" ? {
    title: "Gabung PDF",
    desc: "Gabungkan beberapa file PDF menjadi satu. File diproses langsung di browser Anda dan tidak diunggah ke server PDFin.",
    order: "Urutan file",
    add: "Tambah file",
    process: "Gabung PDF",
    processing: "Memproses",
    done: "Selesai",
    doneMsg: "PDF Anda siap diunduh.",
    download: "Unduh PDF",
    restart: "Mulai ulang",
    output: "hasil-gabungan.pdf",
    related: "Alat terkait",
    relMerge: ["Kompres PDF", "Kecilkan hasil gabungan."],
    relSplit: ["Pisah PDF", "Ambil halaman tertentu."],
    faq: "Pertanyaan umum",
    faqs: [["Apakah file saya diunggah?", "Tidak. Semua proses penggabungan terjadi di browser Anda. PDFin tidak mengunggah file Anda untuk alat ini."], ["Berapa banyak file yang bisa digabung?", "Anda dapat menggabungkan 2–20 file PDF dalam sekali proses."], ["Apakah kualitas file berubah?", "Tidak. Halaman disalin apa adanya — teks dan ukuran halaman asli dipertahankan."]],
    remove: "Hapus file"
  } : {
    title: "Merge PDF",
    desc: "Combine multiple PDFs into one file. Processing happens directly in your browser and your files are not uploaded to PDFin.",
    order: "File order",
    add: "Add file",
    process: "Merge PDF",
    processing: "Processing",
    done: "Completed",
    doneMsg: "Your PDF is ready to download.",
    download: "Download PDF",
    restart: "Start over",
    output: "merged.pdf",
    related: "Related tools",
    relMerge: ["Compress PDF", "Shrink the merged file."],
    relSplit: ["Split PDF", "Extract selected pages."],
    faq: "Frequently asked questions",
    faqs: [["Are my files uploaded?", "No. Merging happens in your browser. PDFin does not upload your files for this tool."], ["How many files can I merge?", "You can merge 2–20 PDF files at once."], ["Does quality change?", "No. Pages are copied as-is — original text and page sizes are preserved."]],
    remove: "Remove file"
  };
  const [files, setFiles] = React.useState([]);
  const [stage, setStage] = React.useState("empty"); // empty | ready | processing | done
  const [progress, setProgress] = React.useState(0);
  const addFiles = () => {
    setFiles(sampleFiles);
    setStage("ready");
  };
  const startMerge = () => {
    setStage("processing");
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setStage("done");
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };
  const reset = () => {
    setFiles([]);
    setStage("empty");
    setProgress(0);
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 880,
      margin: "0 auto",
      padding: "40px 32px 64px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      textAlign: "center",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(MergeDS.PrivacyPill, {
    lang: lang
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--type-h1)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, t.title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body)",
      color: "var(--text-muted)",
      maxWidth: 560,
      margin: 0
    }
  }, t.desc)), stage === "empty" && /*#__PURE__*/React.createElement(MergeDS.Dropzone, {
    lang: lang,
    multiple: true,
    accept: "PDF",
    onSelect: addFiles
  }), stage === "ready" && /*#__PURE__*/React.createElement(MergeDS.Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-label)"
    }
  }, t.order), /*#__PURE__*/React.createElement(MergeDS.Button, {
    variant: "ghost",
    size: "sm",
    onClick: addFiles
  }, "+ ", t.add)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, files.map(f => /*#__PURE__*/React.createElement(MergeDS.FileCard, {
    key: f.id,
    name: f.name,
    meta: f.meta,
    removeLabel: t.remove,
    onRemove: () => setFiles(cur => cur.filter(x => x.id !== f.id))
  }))), /*#__PURE__*/React.createElement(MergeDS.Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    disabled: files.length < 2,
    onClick: startMerge
  }, t.process))), stage === "processing" && /*#__PURE__*/React.createElement(MergeDS.Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(MergeDS.ProgressBar, {
    value: progress,
    label: t.processing
  }), /*#__PURE__*/React.createElement(MergeDS.Button, {
    variant: "ghost",
    size: "sm",
    onClick: reset
  }, lang === "id" ? "Batal" : "Cancel"))), stage === "done" && /*#__PURE__*/React.createElement(MergeDS.Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      textAlign: "center",
      padding: "8px 0"
    }
  }, /*#__PURE__*/React.createElement(MergeDS.Badge, {
    tone: "success"
  }, t.done), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-mono)",
      color: "var(--text-heading)"
    }
  }, t.output), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-muted)",
      margin: 0
    }
  }, t.doneMsg), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(MergeDS.Button, {
    variant: "primary",
    size: "lg",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
    }))
  }, t.download), /*#__PURE__*/React.createElement(MergeDS.Button, {
    variant: "secondary",
    size: "lg",
    onClick: reset
  }, t.restart)))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--type-h3)",
      marginBottom: 14
    }
  }, t.related), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(MergeDS.ToolTile, {
    title: t.relMerge[0],
    description: t.relMerge[1],
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m4 4 6 6m0-6v6H4M20 20l-6-6m6 0v6h-6"
    }))
  }), /*#__PURE__*/React.createElement(MergeDS.ToolTile, {
    title: t.relSplit[0],
    description: t.relSplit[1],
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M16 21h5v-5M8 21H3v-5M21 21l-7-7M3 21l7-7"
    }))
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--type-h3)",
      marginBottom: 14
    }
  }, t.faq), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, t.faqs.map(([q, a]) => /*#__PURE__*/React.createElement(MergeDS.Card, {
    key: q,
    padding: "16px 18px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-label)",
      marginBottom: 4,
      color: "var(--text-heading)"
    }
  }, q), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-muted)"
    }
  }, a))))));
}
Object.assign(window, {
  MergeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/MergeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/app.jsx
try { (() => {
// PDFin workspace — app shell: routing, state machine, file/page model, undo, downloads.
const ADS = window.PDFinDesignSystem_41a2ca;
const DEFS = window.TOOL_DEFS;
const TOOL_IDS = ["merge", "split", "organize", "rotate", "compress", "watermark", "img2pdf", "pdf2img", "pagenum", "flatten", "protect", "unlock", "metadata", "sign", "ocr"];
let uidCounter = 1;
const nextUid = () => "p" + uidCounter++;
function hashTool() {
  const h = (location.hash || "").replace("#", "");
  return TOOL_IDS.includes(h) ? h : "merge";
}
function App() {
  const [lang, setLang] = React.useState(localStorage.getItem("pdfin-ws-lang") || "id");
  const [theme, setTheme] = React.useState(localStorage.getItem("pdfin-ws-theme") || "light");
  const [tool, setTool] = React.useState(hashTool());
  const [files, setFiles] = React.useState([]);
  const [pages, setPages] = React.useState([]);
  const [selection, setSelection] = React.useState(new Set());
  const [opts, setOpts] = React.useState(DEFS[hashTool()].defaults);
  const [stage, setStage] = React.useState("empty");
  const [progress, setProgress] = React.useState(0);
  const [procLabel, setProcLabel] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [errMsg, setErrMsg] = React.useState("");
  const [switcher, setSwitcher] = React.useState(false);
  const [inspOpen, setInspOpen] = React.useState(true);
  const [toasts, setToasts] = React.useState([]);
  const [recent, setRecent] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pdfin-ws-recent") || "[]");
    } catch (e) {
      return [];
    }
  });
  const undoStack = React.useRef([]);
  const cancelled = React.useRef(false);
  const t = window.PDFIN_T[lang];
  const def = DEFS[tool];
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("pdfin-ws-theme", theme);
    localStorage.setItem("pdfin-ws-lang", lang);
  }, [theme, lang]);
  React.useEffect(() => {
    const onHash = () => switchTool(hashTool(), false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  });
  React.useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSwitcher(s => !s);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && undoStack.current.length) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          undo();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  const toast = (msg, tone = "neutral", action = null) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, {
      id,
      msg,
      tone,
      action
    }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 5000);
  };
  const switchTool = (next, pushHash = true) => {
    if (next === tool) {
      setSwitcher(false);
      return;
    }
    // Files with a mismatched kind (images vs pdf) don't carry across
    const nextDef = DEFS[next];
    const keep = !!files.length && !!nextDef.acceptImages === !!def.acceptImages;
    setTool(next);
    setOpts(nextDef.defaults);
    setSelection(new Set());
    setResult(null);
    setErrMsg("");
    undoStack.current = [];
    if (!keep) {
      window.PdfEngine.reset();
      window.PdfProcess.clearCache();
      setFiles([]);
      setPages([]);
      setStage("empty");
    } else setStage(files.length ? "ready" : "empty");
    if (pushHash) location.hash = next;
    setSwitcher(false);
  };
  const addFiles = async fileList => {
    try {
      const added = [];
      for (const f of fileList) {
        const rec = def.acceptImages ? await window.PdfEngine.loadImage(f) : await window.PdfEngine.loadFile(f);
        added.push(rec);
      }
      let base = def.multiFile ? files : [];
      if (!def.multiFile && files.length) {
        files.forEach(f => window.PdfEngine.removeFile(f.id));
        setPages([]);
      }
      const nextFiles = [...base, ...added.map(r => ({
        id: r.id,
        name: r.name,
        size: r.size,
        pageCount: r.pageCount,
        isImage: !!r.isImage
      }))];
      setFiles(nextFiles);
      setPages(prev => {
        const kept = def.multiFile ? prev : [];
        const extra = [];
        added.forEach(r => {
          for (let i = 0; i < r.pageCount; i++) extra.push({
            uid: nextUid(),
            fileId: r.id,
            srcIndex: i,
            rotation: 0
          });
        });
        return [...kept, ...extra];
      });
      setStage("ready");
      const names = [...new Set([...added.map(r => r.name), ...recent])].slice(0, 6);
      setRecent(names);
      localStorage.setItem("pdfin-ws-recent", JSON.stringify(names));
    } catch (e) {
      console.warn(e);
      setErrMsg(lang === "id" ? "File tidak dapat dibaca. Pastikan file PDF valid dan tidak terenkripsi." : "The file could not be read. Make sure it is a valid, unencrypted PDF.");
      setStage("error");
    }
  };
  const addSample = async () => {
    if (def.acceptImages) {
      const mk = (label, hue) => new Promise(res => {
        const c = document.createElement("canvas");
        c.width = 1200;
        c.height = 900;
        const g = c.getContext("2d");
        g.fillStyle = hue;
        g.fillRect(0, 0, 1200, 900);
        g.fillStyle = "rgba(255,255,255,0.85)";
        g.font = "600 64px sans-serif";
        g.fillText(label, 60, 120);
        g.fillStyle = "rgba(255,255,255,0.25)";
        for (let i = 0; i < 5; i++) g.fillRect(60, 200 + i * 110, 1080 - i * 150, 60);
        c.toBlob(b => res(new File([b], label.toLowerCase().replace(" ", "-") + ".jpg", {
          type: "image/jpeg"
        })), "image/jpeg", 0.9);
      });
      addFiles([await mk("Foto rapat 1", "#5518B4"), await mk("Foto rapat 2", "#128FA6"), await mk("Foto rapat 3", "#370C7C")]);
    } else {
      const f1 = await window.PdfEngine.makeSamplePdf(12, "contoh-laporan-tahunan.pdf");
      if (def.multiFile && tool === "merge") {
        const f2 = await window.PdfEngine.makeSamplePdf(5, "contoh-lampiran.pdf");
        addFiles([f1, f2]);
      } else addFiles([f1]);
    }
  };
  const removeFile = id => {
    window.PdfEngine.removeFile(id);
    const nf = files.filter(f => f.id !== id);
    setFiles(nf);
    setPages(ps => ps.filter(p => p.fileId !== id));
    if (!nf.length) setStage("empty");
  };
  const moveFile = (from, to) => {
    const nf = [...files];
    const [m] = nf.splice(from, 1);
    nf.splice(to, 0, m);
    setFiles(nf);
    // rebuild page order to follow file order
    setPages(ps => nf.flatMap(f => ps.filter(p => p.fileId === f.id)));
  };

  // ---- page ops with undo ----
  const snapshot = () => {
    undoStack.current.push(pages);
    if (undoStack.current.length > 30) undoStack.current.shift();
  };
  const undo = () => {
    const prev = undoStack.current.pop();
    if (prev) {
      setPages(prev);
      setSelection(new Set());
    }
  };
  const pageOps = {
    reorder: (from, to) => {
      snapshot();
      setPages(ps => {
        const n = [...ps];
        const [m] = n.splice(from, 1);
        n.splice(to, 0, m);
        return n;
      });
    },
    rotate: (uids, delta) => {
      snapshot();
      setPages(ps => ps.map(p => uids.includes(p.uid) ? {
        ...p,
        rotation: ((p.rotation + delta) % 360 + 360) % 360
      } : p));
    },
    remove: uids => {
      snapshot();
      setPages(ps => ps.filter(p => !uids.includes(p.uid)));
      setSelection(new Set());
      toast(lang === "id" ? `${uids.length} halaman dihapus.` : `${uids.length} page(s) deleted.`, "neutral", /*#__PURE__*/React.createElement(ADS.Button, {
        variant: "ghost",
        size: "sm",
        onClick: undo
      }, t.stage.undo));
    },
    duplicate: uids => {
      snapshot();
      setPages(ps => ps.flatMap(p => uids.includes(p.uid) ? [p, {
        ...p,
        uid: nextUid()
      }] : [p]));
    }
  };
  const ctx = {
    files,
    pages,
    selection,
    setSelection,
    pageOps
  };
  const run = async () => {
    cancelled.current = false;
    setStage("processing");
    setProgress(0);
    setProcLabel(def.processLabel ? def.processLabel(t, lang) : t.stage.processing);
    const t0 = performance.now();
    try {
      const res = await def.process(ctx, opts, pct => setProgress(Math.round(pct)), lang);
      if (cancelled.current) return;
      setResult({
        ...res,
        ms: performance.now() - t0
      });
      setStage("done");
    } catch (e) {
      console.warn(e);
      if (!cancelled.current) {
        setErrMsg("");
        setStage("error");
      }
    }
  };
  const cancel = () => {
    cancelled.current = true;
    setStage(files.length ? "ready" : "empty");
  };
  const download = o => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(o.blob);
    a.download = o.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const downloadAll = () => result.outputs.forEach((o, i) => setTimeout(() => download(o), i * 350));

  // ---- main content by stage ----
  const selectable = def.selectable != null ? def.selectable : def.selectableWhen ? def.selectableWhen(opts) : false;
  let main;
  if (stage === "processing") main = /*#__PURE__*/React.createElement(window.ProcessingView, {
    t: t,
    progress: progress,
    label: procLabel,
    onCancel: cancel
  });else if (stage === "done") main = /*#__PURE__*/React.createElement(window.SuccessView, {
    t: t,
    result: result,
    note: def.simulated ? t.sim : null,
    onDownload: download,
    onDownloadAll: downloadAll,
    onBack: () => setStage("ready"),
    onRestart: () => switchToolResetSame()
  });else if (stage === "error") main = /*#__PURE__*/React.createElement(window.ErrorView, {
    t: t,
    message: errMsg,
    onRetry: () => setStage(files.length ? "ready" : "empty"),
    onRestart: () => switchToolResetSame()
  });else if (stage === "empty") main = /*#__PURE__*/React.createElement(window.EmptyState, {
    t: t,
    tool: tool,
    onFiles: addFiles,
    onSample: addSample,
    acceptImages: def.acceptImages
  });else if (def.view === "preview") main = /*#__PURE__*/React.createElement(window.DocPreview, {
    t: t,
    pages: pages,
    overlay: def.overlay ? def.overlay(opts, setOpts) : null
  });else main = /*#__PURE__*/React.createElement(window.PageGrid, {
    t: t,
    pages: pages,
    selection: selection,
    setSelection: selectable ? setSelection : () => {},
    selectable: selectable,
    onReorder: def.reorder ? pageOps.reorder : null,
    onRotate: def.pageActions || tool === "rotate" ? pageOps.rotate : null,
    onDelete: def.pageActions ? pageOps.remove : null,
    onDuplicate: def.pageActions ? pageOps.duplicate : null
  });
  function switchToolResetSame() {
    window.PdfEngine.reset();
    window.PdfProcess.clearCache();
    setFiles([]);
    setPages([]);
    setSelection(new Set());
    setOpts(def.defaults);
    setResult(null);
    setStage("empty");
    undoStack.current = [];
  }
  const showInspector = stage === "ready" && def.Panel;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-page)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(window.WorkspaceTopNav, {
    t: t,
    tool: tool,
    lang: lang,
    setLang: setLang,
    theme: theme,
    setTheme: setTheme,
    onOpenSwitcher: () => setSwitcher(true)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      minHeight: 0
    },
    "data-screen-label": t.toolNames[tool]
  }, stage !== "done" && stage !== "error" && /*#__PURE__*/React.createElement(window.Sidebar, {
    t: t,
    lang: lang,
    files: files,
    recent: recent,
    onAdd: addFiles,
    onSample: addSample,
    onRemove: removeFile,
    onMoveFile: moveFile,
    stage: stage,
    progress: progress,
    acceptImages: def.acceptImages,
    allowReorder: def.allowReorderFiles
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      position: "relative"
    }
  }, stage === "ready" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 24px 0"
    }
  }, /*#__PURE__*/React.createElement(ADS.PrivacyPill, {
    lang: lang
  }), selectable && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-faint)"
    }
  }, selection.size ? `${selection.size} ${t.select.selected}` : t.empty.hintKeyboard.split(",")[0])), main), showInspector && /*#__PURE__*/React.createElement("aside", {
    style: {
      width: inspOpen ? 300 : 44,
      flex: "none",
      borderLeft: "1px solid var(--border-default)",
      background: "var(--surface-card)",
      display: "flex",
      flexDirection: "column",
      transition: "width var(--duration-base) var(--ease-out)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: inspOpen ? "12px 14px" : "12px 8px",
      borderBottom: inspOpen ? "1px solid var(--border-default)" : "none"
    }
  }, /*#__PURE__*/React.createElement(ADS.IconButton, {
    size: "sm",
    label: inspOpen ? t.inspector.collapse : t.inspector.expand,
    onClick: () => setInspOpen(!inspOpen),
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, inspOpen ? /*#__PURE__*/React.createElement("path", {
      d: "m9 18 6-6-6-6"
    }) : /*#__PURE__*/React.createElement("path", {
      d: "m15 18-6-6 6-6"
    }))
  }), inspOpen && /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--weight-semibold) 13px/1 var(--font-sans)",
      color: "var(--text-heading)",
      margin: 0,
      flex: 1
    }
  }, t.inspector.title), inspOpen && def.simulated && /*#__PURE__*/React.createElement(ADS.Badge, {
    tone: "warning"
  }, "demo")), inspOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement(def.Panel, {
    t: t,
    lang: lang,
    opts: opts,
    setOpts: setOpts,
    ctx: ctx
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      borderTop: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement(ADS.Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    disabled: def.disabled ? def.disabled(ctx, opts) : false,
    onClick: run
  }, t.toolNames[tool]))))), switcher && /*#__PURE__*/React.createElement(window.QuickSwitcher, {
    t: t,
    toolIds: TOOL_IDS,
    current: tool,
    onPick: switchTool,
    onClose: () => setSwitcher(false)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      zIndex: 90,
      alignItems: "center"
    }
  }, toasts.map(x => /*#__PURE__*/React.createElement(ADS.Toast, {
    key: x.id,
    tone: x.tone,
    action: x.action,
    onDismiss: () => setToasts(ts => ts.filter(y => y.id !== x.id))
  }, x.msg))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/engine.js
try { (() => {
// PDFin workspace — PDF engine: pdf.js loading + cached page rendering + sample PDF.
// Plain script; exposes window.PdfEngine. Requires pdf.js (window.pdfjsLib) and pdf-lib (window.PDFLib).
(function () {
  if (window.pdfjsLib) {
    // Workers must be same-origin: wrap the CDN worker in a blob that importScripts it.
    const workerBlob = new Blob(["importScripts('https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js');"], {
      type: "text/javascript"
    });
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
  }
  const PDFJS_OPTS = {
    standardFontDataUrl: "https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/",
    cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
    cMapPacked: true
  };
  let nextId = 1;
  const files = new Map(); // id -> { id, name, size, bytes, doc, pageCount }
  const canvasCache = new Map(); // key -> canvas
  const CACHE_MAX = 80;
  function fmtSize(bytes, lang) {
    const dec = lang === "id" ? "," : ".";
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1).replace(".", dec) + " MB";
    return Math.max(1, Math.round(bytes / 1024)) + " KB";
  }
  async function loadFile(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    // pdf.js transfers the buffer to the worker; keep a copy for pdf-lib.
    const doc = await window.pdfjsLib.getDocument({
      data: bytes.slice(),
      ...PDFJS_OPTS
    }).promise;
    const rec = {
      id: nextId++,
      name: file.name,
      size: file.size,
      bytes,
      doc,
      pageCount: doc.numPages
    };
    files.set(rec.id, rec);
    return rec;
  }
  async function loadImage(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const url = URL.createObjectURL(new Blob([bytes], {
      type: file.type
    }));
    const img = await new Promise((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = url;
    });
    const rec = {
      id: nextId++,
      name: file.name,
      size: file.size,
      bytes,
      img,
      url,
      type: file.type,
      isImage: true,
      pageCount: 1,
      width: img.naturalWidth,
      height: img.naturalHeight
    };
    files.set(rec.id, rec);
    return rec;
  }
  function removeFile(id) {
    const rec = files.get(id);
    if (rec) {
      if (rec.doc) rec.doc.destroy().catch(() => {});
      if (rec.url) URL.revokeObjectURL(rec.url);
      files.delete(id);
      for (const k of [...canvasCache.keys()]) if (k.startsWith(id + ":")) canvasCache.delete(k);
    }
  }
  function reset() {
    for (const id of [...files.keys()]) removeFile(id);
  }

  // Render page (1-based) of file to a canvas at given CSS pixel width. Cached.
  async function renderPage(fileId, pageNo, width) {
    const key = fileId + ":" + pageNo + ":" + Math.round(width);
    if (canvasCache.has(key)) return canvasCache.get(key);
    const rec = files.get(fileId);
    if (!rec) return null;
    let canvas;
    if (rec.isImage) {
      canvas = document.createElement("canvas");
      const scale = width / rec.width;
      canvas.width = Math.round(width * 2);
      canvas.height = Math.round(rec.height * scale * 2);
      canvas.getContext("2d").drawImage(rec.img, 0, 0, canvas.width, canvas.height);
    } else {
      const page = await rec.doc.getPage(pageNo);
      const vp1 = page.getViewport({
        scale: 1
      });
      const scale = width / vp1.width * 2; // 2x for crispness
      const vp = page.getViewport({
        scale
      });
      canvas = document.createElement("canvas");
      canvas.width = Math.round(vp.width);
      canvas.height = Math.round(vp.height);
      await page.render({
        canvasContext: canvas.getContext("2d"),
        viewport: vp,
        intent: "print"
      }).promise;
    }
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    if (canvasCache.size >= CACHE_MAX) canvasCache.delete(canvasCache.keys().next().value);
    canvasCache.set(key, canvas);
    return canvas;
  }
  async function pageSize(fileId, pageNo) {
    const rec = files.get(fileId);
    if (!rec) return {
      width: 595,
      height: 842
    };
    if (rec.isImage) return {
      width: rec.width,
      height: rec.height
    };
    const page = await rec.doc.getPage(pageNo);
    const vp = page.getViewport({
      scale: 1
    });
    return {
      width: vp.width,
      height: vp.height
    };
  }

  // Generate a realistic bilingual sample document.
  async function makeSamplePdf(pageCount, name) {
    const {
      PDFDocument,
      StandardFonts,
      rgb
    } = window.PDFLib;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const sections = ["Ringkasan eksekutif", "Latar belakang", "Analisis pasar", "Rencana operasional", "Proyeksi keuangan", "Manajemen risiko", "Lampiran"];
    for (let i = 0; i < pageCount; i++) {
      const p = doc.addPage([595.28, 841.89]);
      const title = sections[i % sections.length];
      p.drawText("Laporan Tahunan 2026", {
        x: 56,
        y: 800,
        size: 9,
        font,
        color: rgb(0.45, 0.43, 0.55)
      });
      p.drawText(String(i + 1), {
        x: 525,
        y: 40,
        size: 9,
        font,
        color: rgb(0.45, 0.43, 0.55)
      });
      p.drawText(`${i + 1}. ${title}`, {
        x: 56,
        y: 754,
        size: 22,
        font: bold,
        color: rgb(0.11, 0.09, 0.19)
      });
      p.drawRectangle({
        x: 56,
        y: 738,
        width: 60,
        height: 3,
        color: rgb(0.33, 0.09, 0.71)
      });
      let y = 700;
      for (let ln = 0; ln < 30; ln++) {
        const w = 483 - ln * 137 % 180;
        p.drawRectangle({
          x: 56,
          y,
          width: ln % 8 === 7 ? w * 0.4 : w,
          height: 7,
          color: rgb(0.88, 0.87, 0.92)
        });
        y -= ln % 8 === 7 ? 30 : 17;
        if (y < 80) break;
      }
      if (i % 3 === 1) {
        p.drawRectangle({
          x: 56,
          y: 90,
          width: 483,
          height: 150,
          borderColor: rgb(0.8, 0.78, 0.87),
          borderWidth: 1
        });
        [30, 70, 110, 55, 90, 130, 45].forEach((h, bi) => {
          p.drawRectangle({
            x: 80 + bi * 64,
            y: 100,
            width: 34,
            height: h,
            color: bi % 2 ? rgb(0.14, 0.8, 0.85) : rgb(0.33, 0.09, 0.71)
          });
        });
      }
    }
    const bytes = await doc.save();
    return new File([bytes], name || "contoh-laporan.pdf", {
      type: "application/pdf"
    });
  }
  window.PdfEngine = {
    files,
    loadFile,
    loadImage,
    removeFile,
    reset,
    renderPage,
    pageSize,
    makeSamplePdf,
    fmtSize
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/engine.js", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/i18n.js
try { (() => {
// PDFin workspace — bilingual strings (Indonesian-first). window.PDFIN_T[lang]
window.PDFIN_T = {
  id: {
    breadcrumbHome: "Beranda",
    breadcrumbTools: "Alat",
    allTools: "Semua alat",
    searchTools: "Cari alat…",
    noToolMatch: "Tidak ada alat yang cocok.",
    quickSwitchHint: "Ctrl+K untuk ganti alat",
    sidebar: {
      files: "File",
      addFile: "Tambah file",
      sample: "Coba dengan file contoh",
      queue: "Antrean proses",
      recent: "Terakhir dibuka",
      shortcuts: "Pintasan",
      remove: "Hapus file"
    },
    drop: {
      title: "Letakkan file di sini",
      or: "atau",
      browse: "Pilih file",
      types: "PDF hingga 100 MB",
      typesImg: "JPG, PNG hingga 50 MB"
    },
    privacy: "File Anda diproses di browser. PDFin tidak mengunggah file Anda untuk alat ini.",
    inspector: {
      title: "Pengaturan",
      output: "Hasil",
      collapse: "Sembunyikan panel",
      expand: "Tampilkan panel"
    },
    stage: {
      process: "Proses",
      processing: "Memproses",
      cancel: "Batal",
      done: "Selesai",
      download: "Unduh",
      downloadAll: "Unduh semua",
      restart: "Mulai ulang",
      again: "Buka lagi",
      back: "Kembali ke ruang kerja",
      undo: "Urungkan"
    },
    success: {
      title: "Selesai",
      size: "Ukuran file",
      time: "Waktu proses",
      files: "file",
      pages: "halaman"
    },
    error: {
      title: "Terjadi kesalahan",
      body: "File tidak dapat diproses. Coba periksa apakah file rusak atau terenkripsi.",
      retry: "Coba lagi"
    },
    empty: {
      hintKeyboard: "Tarik file, tempel (Ctrl+V), atau pilih dari perangkat Anda."
    },
    sim: "Simulasi prototipe — hasil belum dienkripsi/di-OCR.",
    select: {
      all: "Pilih semua",
      none: "Batal pilih",
      selected: "dipilih"
    },
    pageMenu: {
      rotateR: "Putar ke kanan",
      rotateL: "Putar ke kiri",
      duplicate: "Duplikat",
      delete: "Hapus halaman",
      restore: "Pulihkan"
    },
    shortcuts: [["Ctrl+K", "Ganti alat"], ["←→", "Pindah halaman"], ["Klik", "Pilih halaman"], ["R", "Putar"], ["Del", "Hapus"], ["Ctrl+A", "Pilih semua"], ["Ctrl+Z", "Urungkan"]],
    zoom: {
      fitWidth: "Pas lebar",
      in: "Perbesar",
      out: "Perkecil"
    },
    toolNames: {
      merge: "Gabung PDF",
      split: "Pisah PDF",
      organize: "Atur Halaman",
      rotate: "Putar PDF",
      compress: "Kompres PDF",
      watermark: "Watermark PDF",
      img2pdf: "Gambar ke PDF",
      pdf2img: "PDF ke Gambar",
      pagenum: "Nomor Halaman",
      flatten: "Ratakan PDF",
      protect: "Kunci PDF",
      unlock: "Buka Kunci PDF",
      metadata: "Metadata PDF",
      sign: "Tanda Tangan PDF",
      ocr: "OCR PDF"
    },
    toolDesc: {
      merge: "Gabungkan beberapa file PDF menjadi satu.",
      split: "Pisahkan PDF per N halaman, rentang, atau halaman pilihan.",
      organize: "Susun ulang, putar, duplikat, dan hapus halaman.",
      rotate: "Putar halaman tertentu atau semua halaman.",
      compress: "Kecilkan ukuran file dengan tingkat kompresi pilihan.",
      watermark: "Tambahkan watermark teks atau gambar.",
      img2pdf: "Ubah JPG/PNG menjadi dokumen PDF.",
      pdf2img: "Ekspor halaman PDF sebagai gambar.",
      pagenum: "Tambahkan nomor halaman dengan posisi dan gaya pilihan.",
      flatten: "Ratakan anotasi dan isian formulir menjadi konten permanen.",
      protect: "Lindungi PDF dengan kata sandi.",
      unlock: "Buka PDF yang terkunci kata sandi.",
      metadata: "Lihat dan ubah judul, penulis, dan kata kunci.",
      sign: "Bubuhkan tanda tangan pada halaman.",
      ocr: "Jadikan PDF hasil pindaian dapat dicari."
    }
  },
  en: {
    breadcrumbHome: "Home",
    breadcrumbTools: "Tools",
    allTools: "All tools",
    searchTools: "Search tools…",
    noToolMatch: "No matching tool.",
    quickSwitchHint: "Ctrl+K to switch tools",
    sidebar: {
      files: "Files",
      addFile: "Add file",
      sample: "Try with a sample file",
      queue: "Processing queue",
      recent: "Recently opened",
      shortcuts: "Shortcuts",
      remove: "Remove file"
    },
    drop: {
      title: "Drop files here",
      or: "or",
      browse: "Choose file",
      types: "PDF up to 100 MB",
      typesImg: "JPG, PNG up to 50 MB"
    },
    privacy: "Your files are processed in your browser. PDFin does not upload your files for this tool.",
    inspector: {
      title: "Settings",
      output: "Output",
      collapse: "Hide panel",
      expand: "Show panel"
    },
    stage: {
      process: "Process",
      processing: "Processing",
      cancel: "Cancel",
      done: "Completed",
      download: "Download",
      downloadAll: "Download all",
      restart: "Start over",
      again: "Open again",
      back: "Back to workspace",
      undo: "Undo"
    },
    success: {
      title: "Completed",
      size: "File size",
      time: "Processing time",
      files: "files",
      pages: "pages"
    },
    error: {
      title: "Something went wrong",
      body: "The file could not be processed. Check whether it is damaged or encrypted.",
      retry: "Retry"
    },
    empty: {
      hintKeyboard: "Drag files, paste (Ctrl+V), or choose from your device."
    },
    sim: "Prototype simulation — output is not actually encrypted/OCR-ed.",
    select: {
      all: "Select all",
      none: "Clear selection",
      selected: "selected"
    },
    pageMenu: {
      rotateR: "Rotate right",
      rotateL: "Rotate left",
      duplicate: "Duplicate",
      delete: "Delete page",
      restore: "Restore"
    },
    shortcuts: [["Ctrl+K", "Switch tool"], ["←→", "Move between pages"], ["Click", "Select page"], ["R", "Rotate"], ["Del", "Delete"], ["Ctrl+A", "Select all"], ["Ctrl+Z", "Undo"]],
    zoom: {
      fitWidth: "Fit width",
      in: "Zoom in",
      out: "Zoom out"
    },
    toolNames: {
      merge: "Merge PDF",
      split: "Split PDF",
      organize: "Organize Pages",
      rotate: "Rotate PDF",
      compress: "Compress PDF",
      watermark: "Watermark PDF",
      img2pdf: "Images to PDF",
      pdf2img: "PDF to Image",
      pagenum: "Page Numbers",
      flatten: "Flatten PDF",
      protect: "Protect PDF",
      unlock: "Unlock PDF",
      metadata: "PDF Metadata",
      sign: "Sign PDF",
      ocr: "OCR PDF"
    },
    toolDesc: {
      merge: "Combine multiple PDF files into one.",
      split: "Split every N pages, by range, or by selected pages.",
      organize: "Reorder, rotate, duplicate, and delete pages.",
      rotate: "Rotate individual pages or the whole document.",
      compress: "Reduce file size with a chosen compression level.",
      watermark: "Add a text or image watermark.",
      img2pdf: "Turn JPG/PNG images into a PDF document.",
      pdf2img: "Export PDF pages as images.",
      pagenum: "Add page numbers with custom position and style.",
      flatten: "Flatten annotations and form fields into permanent content.",
      protect: "Protect a PDF with a password.",
      unlock: "Unlock a password-protected PDF.",
      metadata: "View and edit title, author, and keywords.",
      sign: "Place a signature on a page.",
      ocr: "Make scanned PDFs searchable."
    }
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/i18n.js", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/process.js
try { (() => {
// PDFin workspace — real PDF processing via pdf-lib (+ pdf.js rendering for raster ops).
// Exposes window.PdfProcess. All functions return { outputs: [{ name, blob, size, pages }] }.
(function () {
  const P = () => window.PDFLib;
  const E = () => window.PdfEngine;
  const srcCache = new Map(); // fileId -> PDFDocument promise
  function srcDoc(fileId) {
    if (!srcCache.has(fileId)) {
      const rec = E().files.get(fileId);
      srcCache.set(fileId, P().PDFDocument.load(rec.bytes, {
        ignoreEncryption: true
      }));
    }
    return srcCache.get(fileId);
  }
  function clearCache() {
    srcCache.clear();
  }
  function out(name, bytes, pages) {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes], {
      type: "application/pdf"
    });
    return {
      name,
      blob,
      size: blob.size,
      pages
    };
  }
  const tick = () => new Promise(r => setTimeout(r, 0));

  // Assemble a new PDF from a worklist of pages [{fileId, srcIndex, rotation, deleted}].
  async function assemble(pages, name, onProgress) {
    const {
      PDFDocument,
      degrees
    } = P();
    const doc = await PDFDocument.create();
    const live = pages.filter(p => !p.deleted);
    // Group contiguous copies per source for speed
    for (let i = 0; i < live.length; i++) {
      const pg = live[i];
      const src = await srcDoc(pg.fileId);
      const [copied] = await doc.copyPages(src, [pg.srcIndex]);
      if (pg.rotation) copied.setRotation(degrees(((copied.getRotation().angle + pg.rotation) % 360 + 360) % 360));
      doc.addPage(copied);
      if (onProgress) onProgress((i + 1) / live.length * 90);
      if (i % 10 === 9) await tick();
    }
    const bytes = await doc.save();
    if (onProgress) onProgress(100);
    return {
      outputs: [out(name, bytes, live.length)]
    };
  }
  async function split(pages, opts, baseName, onProgress) {
    const live = pages.filter(p => !p.deleted);
    const groups = [];
    if (opts.mode === "every") {
      const n = Math.max(1, opts.n | 0);
      for (let i = 0; i < live.length; i += n) groups.push(live.slice(i, i + n));
    } else if (opts.mode === "range") {
      const sel = parseRange(opts.range, live.length);
      groups.push(sel.map(i => live[i]));
    } else {
      groups.push(live.filter(p => opts.selected.has(p.uid)));
    }
    const outputs = [];
    const {
      PDFDocument,
      degrees
    } = P();
    let done = 0,
      total = groups.reduce((a, g) => a + g.length, 0) || 1;
    for (let g = 0; g < groups.length; g++) {
      if (!groups[g].length) continue;
      const doc = await PDFDocument.create();
      for (const pg of groups[g]) {
        const src = await srcDoc(pg.fileId);
        const [c] = await doc.copyPages(src, [pg.srcIndex]);
        if (pg.rotation) c.setRotation(degrees(((c.getRotation().angle + pg.rotation) % 360 + 360) % 360));
        doc.addPage(c);
        done++;
        if (onProgress) onProgress(done / total * 95);
      }
      const suffix = groups.length > 1 ? "-" + String(g + 1) : opts.mode === "range" ? "-" + opts.range.replace(/[^0-9,-]/g, "") : "-halaman";
      outputs.push(out(baseName + suffix + ".pdf", await doc.save(), groups[g].length));
      await tick();
    }
    if (onProgress) onProgress(100);
    return {
      outputs
    };
  }
  function parseRange(str, max) {
    const set = new Set();
    (str || "").split(",").forEach(part => {
      const m = part.trim().match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        for (let i = +m[1]; i <= +m[2]; i++) if (i >= 1 && i <= max) set.add(i - 1);
      } else if (/^\d+$/.test(part.trim())) {
        const i = +part.trim();
        if (i >= 1 && i <= max) set.add(i - 1);
      }
    });
    return [...set].sort((a, b) => a - b);
  }

  // Re-render every page to JPEG at a quality level and rebuild the PDF.
  async function compress(pages, opts, name, onProgress) {
    const {
      PDFDocument
    } = P();
    const doc = await PDFDocument.create();
    const live = pages.filter(p => !p.deleted);
    const widths = {
      low: 900,
      medium: 1200,
      high: 1600
    };
    const quality = {
      low: 0.5,
      medium: 0.68,
      high: 0.82
    }[opts.level];
    for (let i = 0; i < live.length; i++) {
      const pg = live[i];
      const size = await E().pageSize(pg.fileId, pg.srcIndex + 1);
      const canvas = await E().renderPage(pg.fileId, pg.srcIndex + 1, widths[opts.level] / 2);
      const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", quality));
      const jpg = await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const page = doc.addPage([size.width, size.height]);
      page.drawImage(jpg, {
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
      });
      if (onProgress) onProgress((i + 1) / live.length * 92);
      await tick();
    }
    const bytes = await doc.save();
    if (onProgress) onProgress(100);
    return {
      outputs: [out(name, bytes, live.length)]
    };
  }
  async function watermark(files, opts, onProgress) {
    const {
      PDFDocument,
      StandardFonts,
      degrees,
      rgb
    } = P();
    const outputs = [];
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, {
        ignoreEncryption: true
      });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      let image = null;
      if (opts.kind === "image" && opts.imageBytes) {
        image = opts.imageType === "image/png" ? await doc.embedPng(opts.imageBytes) : await doc.embedJpg(opts.imageBytes);
      }
      const pagesArr = doc.getPages();
      for (let i = 0; i < pagesArr.length; i++) {
        const page = pagesArr[i];
        const {
          width,
          height
        } = page.getSize();
        const pos = anchor(opts.align, width, height);
        if (opts.kind === "text") {
          const size = opts.size / 100 * (width / 3);
          const tw = font.widthOfTextAtSize(opts.text, size);
          page.drawText(opts.text, {
            x: pos.x - tw / 2 * Math.cos(opts.rotation * Math.PI / 180),
            y: pos.y - tw / 2 * Math.sin(opts.rotation * Math.PI / 180),
            size,
            font,
            color: rgb(0.42, 0.4, 0.53),
            opacity: opts.opacity / 100,
            rotate: degrees(opts.rotation)
          });
        } else if (image) {
          const w = opts.size / 100 * width * 0.9;
          const h = w * (image.height / image.width);
          page.drawImage(image, {
            x: pos.x - w / 2,
            y: pos.y - h / 2,
            width: w,
            height: h,
            opacity: opts.opacity / 100,
            rotate: degrees(opts.rotation)
          });
        }
        if (onProgress) onProgress((f + (i + 1) / pagesArr.length) / files.length * 95);
      }
      const base = files[f].name.replace(/\.pdf$/i, "");
      outputs.push(out(base + "-watermark.pdf", await doc.save(), pagesArr.length));
      await tick();
    }
    if (onProgress) onProgress(100);
    return {
      outputs
    };
  }
  function anchor(align, w, h) {
    const xs = {
      left: w * 0.25,
      center: w / 2,
      right: w * 0.75
    };
    const ys = {
      top: h * 0.8,
      middle: h / 2,
      bottom: h * 0.18
    };
    const [v, hz] = align.split("-"); // e.g. "middle-center"
    return {
      x: xs[hz] || w / 2,
      y: ys[v] || h / 2
    };
  }
  const PAGE_SIZES = {
    a4: [595.28, 841.89],
    letter: [612, 792],
    f4: [609.45, 935.43]
  };
  async function imagesToPdf(images, opts, name, onProgress) {
    const {
      PDFDocument
    } = P();
    const doc = await PDFDocument.create();
    for (let i = 0; i < images.length; i++) {
      const rec = E().files.get(images[i].id);
      let dims = PAGE_SIZES[opts.pageSize] || PAGE_SIZES.a4;
      if (opts.orientation === "landscape") dims = [dims[1], dims[0]];
      if (opts.pageSize === "fit") dims = [rec.width * 0.75, rec.height * 0.75];
      const margin = {
        none: 0,
        small: 24,
        large: 56
      }[opts.margin] || 0;
      const img = rec.type === "image/png" ? await doc.embedPng(rec.bytes) : await doc.embedJpg(rec.bytes);
      const page = doc.addPage(dims);
      const availW = dims[0] - margin * 2,
        availH = dims[1] - margin * 2;
      const scale = Math.min(availW / img.width, availH / img.height);
      const w = img.width * scale,
        h = img.height * scale;
      page.drawImage(img, {
        x: (dims[0] - w) / 2,
        y: (dims[1] - h) / 2,
        width: w,
        height: h
      });
      if (onProgress) onProgress((i + 1) / images.length * 92);
      await tick();
    }
    const bytes = await doc.save();
    if (onProgress) onProgress(100);
    return {
      outputs: [out(name, bytes, images.length)]
    };
  }
  async function pdfToImages(pages, opts, baseName, onProgress) {
    const live = pages.filter(p => !p.deleted && (!opts.selected || !opts.selected.size || opts.selected.has(p.uid)));
    const outputs = [];
    const scaleW = opts.dpi / 72 * 595; // approx A4 width at dpi
    for (let i = 0; i < live.length; i++) {
      const canvas = await E().renderPage(live[i].fileId, live[i].srcIndex + 1, scaleW / 2);
      const mime = opts.format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise(r => canvas.toBlob(r, mime, opts.format === "png" ? undefined : opts.quality / 100));
      outputs.push({
        name: `${baseName}-${i + 1}.${opts.format}`,
        blob,
        size: blob.size,
        isImage: true
      });
      if (onProgress) onProgress((i + 1) / live.length * 96);
      await tick();
    }
    if (onProgress) onProgress(100);
    return {
      outputs
    };
  }
  async function pageNumbers(files, opts, onProgress) {
    const {
      PDFDocument,
      StandardFonts,
      rgb
    } = P();
    const fonts = {
      helvetica: StandardFonts.Helvetica,
      times: StandardFonts.TimesRoman,
      courier: StandardFonts.Courier
    };
    const colors = {
      ink: rgb(0.17, 0.14, 0.3),
      gray: rgb(0.55, 0.53, 0.65),
      violet: rgb(0.33, 0.09, 0.71)
    };
    const outputs = [];
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, {
        ignoreEncryption: true
      });
      const font = await doc.embedFont(fonts[opts.font] || fonts.helvetica);
      const pagesArr = doc.getPages();
      pagesArr.forEach((page, i) => {
        const {
          width,
          height
        } = page.getSize();
        const label = opts.format === "n_of_total" ? `${i + 1} / ${pagesArr.length}` : opts.format === "page_n" ? `Halaman ${i + 1}` : String(i + 1);
        const tw = font.widthOfTextAtSize(label, opts.fontSize);
        const x = opts.position.endsWith("left") ? opts.margin : opts.position.endsWith("center") ? (width - tw) / 2 : width - opts.margin - tw;
        const y = opts.position.startsWith("top") ? height - opts.margin - opts.fontSize : opts.margin;
        page.drawText(label, {
          x,
          y,
          size: opts.fontSize,
          font,
          color: colors[opts.color] || colors.ink
        });
        if (onProgress) onProgress((f + (i + 1) / pagesArr.length) / files.length * 95);
      });
      const base = files[f].name.replace(/\.pdf$/i, "");
      outputs.push(out(base + "-bernomor.pdf", await doc.save(), pagesArr.length));
      await tick();
    }
    if (onProgress) onProgress(100);
    return {
      outputs
    };
  }
  async function flatten(files, opts, onProgress) {
    const {
      PDFDocument
    } = P();
    const outputs = [];
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, {
        ignoreEncryption: true
      });
      try {
        doc.getForm().flatten();
      } catch (e) {/* no form fields — pass through */}
      if (onProgress) onProgress((f + 1) / files.length * 90);
      const base = files[f].name.replace(/\.pdf$/i, "");
      outputs.push(out(base + "-flat.pdf", await doc.save(), doc.getPageCount()));
      await tick();
    }
    if (onProgress) onProgress(100);
    return {
      outputs
    };
  }
  async function metadata(files, opts, onProgress) {
    const {
      PDFDocument
    } = P();
    const doc = await PDFDocument.load(E().files.get(files[0].id).bytes, {
      ignoreEncryption: true,
      updateMetadata: true
    });
    if (opts.title != null) doc.setTitle(opts.title);
    if (opts.author != null) doc.setAuthor(opts.author);
    if (opts.subject != null) doc.setSubject(opts.subject);
    if (opts.keywords != null) doc.setKeywords(opts.keywords.split(",").map(s => s.trim()).filter(Boolean));
    doc.setModificationDate(new Date());
    if (onProgress) onProgress(80);
    const base = files[0].name.replace(/\.pdf$/i, "");
    const res = {
      outputs: [out(base + "-metadata.pdf", await doc.save(), doc.getPageCount())]
    };
    if (onProgress) onProgress(100);
    return res;
  }
  async function readMetadata(fileId) {
    const {
      PDFDocument
    } = P();
    const doc = await PDFDocument.load(E().files.get(fileId).bytes, {
      ignoreEncryption: true
    });
    return {
      title: safe(() => doc.getTitle()) || "",
      author: safe(() => doc.getAuthor()) || "",
      subject: safe(() => doc.getSubject()) || "",
      keywords: safe(() => doc.getKeywords()) || ""
    };
  }
  function safe(fn) {
    try {
      return fn();
    } catch (e) {
      return "";
    }
  }
  async function sign(files, opts, onProgress) {
    const {
      PDFDocument
    } = P();
    const doc = await PDFDocument.load(E().files.get(files[0].id).bytes, {
      ignoreEncryption: true
    });
    const png = await doc.embedPng(opts.signaturePng);
    const page = doc.getPage(opts.pageIndex);
    const {
      width,
      height
    } = page.getSize();
    // opts.rect is fractional {x, y, w} relative to the page (y from top)
    const w = opts.rect.w * width;
    const h = w * (png.height / png.width);
    page.drawImage(png, {
      x: opts.rect.x * width,
      y: height - opts.rect.y * height - h,
      width: w,
      height: h
    });
    if (onProgress) onProgress(90);
    const base = files[0].name.replace(/\.pdf$/i, "");
    const res = {
      outputs: [out(base + "-ditandatangani.pdf", await doc.save(), doc.getPageCount())]
    };
    if (onProgress) onProgress(100);
    return res;
  }

  // Simulated ops (encryption + OCR are out of scope for this prototype engine):
  // output is a faithful copy; UI labels these as prototype simulations.
  async function passthrough(files, suffix, onProgress, slow) {
    const outputs = [];
    for (let f = 0; f < files.length; f++) {
      const rec = E().files.get(files[f].id);
      const steps = slow ? 24 : 8;
      for (let s = 0; s < steps; s++) {
        await new Promise(r => setTimeout(r, slow ? 140 : 60));
        if (onProgress) onProgress((f + (s + 1) / steps) / files.length * 100);
      }
      const base = rec.name.replace(/\.pdf$/i, "");
      outputs.push(out(base + suffix + ".pdf", rec.bytes.slice(), rec.pageCount));
    }
    return {
      outputs
    };
  }
  window.PdfProcess = {
    clearCache,
    assemble,
    split,
    parseRange,
    compress,
    watermark,
    imagesToPdf,
    pdfToImages,
    pageNumbers,
    flatten,
    metadata,
    readMetadata,
    sign,
    passthrough
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/process.js", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/tools-1.jsx
try { (() => {
// PDFin workspace — tool defs part 1: shared inspector helpers + merge, split, organize, rotate, compress.
const TDS = window.PDFinDesignSystem_41a2ca;

// ---- Shared inspector field helpers ----
function Field({
  label,
  children,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-semibold) 12px/1 var(--font-sans)",
      color: "var(--text-body)"
    }
  }, label), children, hint && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "11px/1.4 var(--font-sans)",
      color: "var(--text-faint)"
    }
  }, hint));
}
function Segmented({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    style: {
      display: "flex",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-md)",
      padding: 3,
      gap: 2
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": value === o.value,
    onClick: () => onChange(o.value),
    style: {
      flex: 1,
      padding: "6px 8px",
      border: "none",
      borderRadius: 7,
      cursor: "pointer",
      background: value === o.value ? "var(--surface-card)" : "transparent",
      boxShadow: value === o.value ? "var(--shadow-card)" : "none",
      color: value === o.value ? "var(--text-heading)" : "var(--text-muted)",
      font: "var(--weight-semibold) 12px/1.2 var(--font-sans)",
      whiteSpace: "nowrap"
    }
  }, o.label)));
}
function SliderRow({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = ""
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-semibold) 12px/1 var(--font-sans)",
      color: "var(--text-body)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "11.5px var(--font-mono)",
      color: "var(--text-muted)"
    }
  }, value, unit)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    "aria-label": label,
    onChange: e => onChange(+e.target.value),
    style: {
      width: "100%",
      accentColor: "var(--action-primary)"
    }
  }));
}
function PosGrid({
  value,
  onChange,
  rows = ["top", "middle", "bottom"]
}) {
  const cols = ["left", "center", "right"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 4,
      width: 120
    }
  }, rows.map(r => cols.map(c => {
    const v = r + "-" + c;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      "aria-label": v,
      onClick: () => onChange(v),
      style: {
        aspectRatio: "1",
        border: value === v ? "2px solid var(--action-primary)" : "1px solid var(--border-default)",
        borderRadius: 6,
        background: value === v ? "var(--surface-brand-subtle)" : "var(--surface-card)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 2,
        background: value === v ? "var(--action-primary)" : "var(--ink-300)"
      }
    }));
  })));
}
function SelCount({
  t,
  n
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: n ? "var(--text-brand)" : "var(--text-faint)"
    }
  }, n, " ", t.select.selected);
}
const TX = (lang, id, en) => lang === "id" ? id : en;

// ---- Tool definitions ----
const TOOL_DEFS = {};
TOOL_DEFS.merge = {
  multiFile: true,
  allowReorderFiles: true,
  view: "grid",
  selectable: false,
  defaults: {},
  disabled: ctx => ctx.files.length < 2,
  outName: lang => TX(lang, "hasil-gabungan.pdf", "merged.pdf"),
  Panel: ({
    t,
    lang,
    ctx
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(TDS.Alert, {
    tone: "info"
  }, TX(lang, "Urutkan file di panel kiri — halaman digabung sesuai urutan itu.", "Reorder files in the left panel — pages are merged in that order.")), /*#__PURE__*/React.createElement(Field, {
    label: TX(lang, "Ringkasan", "Summary")
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "12.5px var(--font-mono)",
      color: "var(--text-muted)"
    }
  }, ctx.files.length, " ", t.success.files, " \xB7 ", ctx.pages.filter(p => !p.deleted).length, " ", t.success.pages)), ctx.files.length < 2 && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-faint)"
    }
  }, TX(lang, "Tambahkan minimal 2 file PDF.", "Add at least 2 PDF files."))),
  process: (ctx, opts, onP, lang) => window.PdfProcess.assemble(ctx.pages, TOOL_DEFS.merge.outName(lang), onP)
};
TOOL_DEFS.split = {
  view: "grid",
  defaults: {
    mode: "every",
    n: 2,
    range: "1-3"
  },
  selectableWhen: opts => opts.mode === "selected",
  disabled: (ctx, opts) => opts.mode === "selected" && ctx.selection.size === 0,
  Panel: ({
    t,
    lang,
    opts,
    setOpts,
    ctx
  }) => {
    const live = ctx.pages.filter(p => !p.deleted);
    const nOut = opts.mode === "every" ? Math.ceil(live.length / Math.max(1, opts.n)) : 1;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Cara memisah", "Split method")
    }, /*#__PURE__*/React.createElement(Segmented, {
      value: opts.mode,
      onChange: mode => setOpts({
        ...opts,
        mode
      }),
      options: [{
        value: "every",
        label: TX(lang, "Tiap N", "Every N")
      }, {
        value: "range",
        label: TX(lang, "Rentang", "Range")
      }, {
        value: "selected",
        label: TX(lang, "Pilihan", "Selected")
      }]
    })), opts.mode === "every" && /*#__PURE__*/React.createElement(SliderRow, {
      label: TX(lang, "Halaman per file", "Pages per file"),
      value: opts.n,
      min: 1,
      max: Math.max(2, live.length),
      onChange: n => setOpts({
        ...opts,
        n
      })
    }), opts.mode === "range" && /*#__PURE__*/React.createElement(TDS.Input, {
      mono: true,
      label: TX(lang, "Rentang halaman", "Page range"),
      value: opts.range,
      placeholder: "1-3, 7, 10-12",
      onChange: e => setOpts({
        ...opts,
        range: e.target.value
      }),
      hint: TX(lang, "Contoh: 1-3, 7, 10-12", "Example: 1-3, 7, 10-12")
    }), opts.mode === "selected" && /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Halaman terpilih", "Selected pages")
    }, /*#__PURE__*/React.createElement(SelCount, {
      t: t,
      n: ctx.selection.size
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "11px/1.4 var(--font-sans)",
        color: "var(--text-faint)"
      }
    }, TX(lang, "Klik halaman di kiri untuk memilih.", "Click pages on the left to select."))), /*#__PURE__*/React.createElement(Field, {
      label: t.inspector.output
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "12.5px var(--font-mono)",
        color: "var(--text-muted)"
      }
    }, opts.mode === "every" ? `${nOut} file PDF` : opts.mode === "range" ? `1 file · ${window.PdfProcess.parseRange(opts.range, live.length).length} ${t.success.pages}` : `1 file · ${ctx.selection.size} ${t.success.pages}`)));
  },
  process: (ctx, opts, onP, lang) => {
    const base = ctx.files[0] ? ctx.files[0].name.replace(/\.pdf$/i, "") : "hasil";
    return window.PdfProcess.split(ctx.pages, {
      ...opts,
      selected: ctx.selection
    }, base, onP);
  }
};
TOOL_DEFS.organize = {
  view: "grid",
  selectable: true,
  reorder: true,
  pageActions: true,
  undoable: true,
  defaults: {},
  Panel: ({
    t,
    lang,
    ctx
  }) => {
    const sel = [...ctx.selection];
    const any = sel.length > 0;
    const B = ({
      children,
      onClick,
      danger,
      disabled
    }) => /*#__PURE__*/React.createElement(TDS.Button, {
      variant: danger ? "danger" : "secondary",
      size: "sm",
      fullWidth: true,
      disabled: disabled,
      onClick: onClick
    }, children);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Halaman terpilih", "Selected pages")
    }, /*#__PURE__*/React.createElement(SelCount, {
      t: t,
      n: sel.length
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(B, {
      disabled: !any,
      onClick: () => ctx.pageOps.rotate(sel, -90)
    }, t.pageMenu.rotateL), /*#__PURE__*/React.createElement(B, {
      disabled: !any,
      onClick: () => ctx.pageOps.rotate(sel, 90)
    }, t.pageMenu.rotateR), /*#__PURE__*/React.createElement(B, {
      disabled: !any,
      onClick: () => ctx.pageOps.duplicate(sel)
    }, t.pageMenu.duplicate), /*#__PURE__*/React.createElement(B, {
      danger: true,
      disabled: !any,
      onClick: () => ctx.pageOps.remove(sel)
    }, t.pageMenu.delete)), /*#__PURE__*/React.createElement(TDS.Alert, {
      tone: "info"
    }, TX(lang, "Tarik kartu halaman untuk menyusun ulang. Klik kanan untuk menu aksi.", "Drag page cards to reorder. Right-click for actions.")));
  },
  disabled: ctx => ctx.pages.filter(p => !p.deleted).length === 0,
  outName: lang => TX(lang, "halaman-tersusun.pdf", "organized.pdf"),
  process: (ctx, opts, onP, lang) => window.PdfProcess.assemble(ctx.pages, TOOL_DEFS.organize.outName(lang), onP)
};
TOOL_DEFS.rotate = {
  view: "grid",
  selectable: true,
  defaults: {},
  Panel: ({
    t,
    lang,
    ctx
  }) => {
    const sel = [...ctx.selection];
    const all = ctx.pages.filter(p => !p.deleted).map(p => p.uid);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Halaman terpilih", "Selected pages")
    }, /*#__PURE__*/React.createElement(SelCount, {
      t: t,
      n: sel.length
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(TDS.Button, {
      variant: "secondary",
      size: "sm",
      disabled: !sel.length,
      onClick: () => ctx.pageOps.rotate(sel, -90)
    }, "\u21BA \u221290\xB0"), /*#__PURE__*/React.createElement(TDS.Button, {
      variant: "secondary",
      size: "sm",
      disabled: !sel.length,
      onClick: () => ctx.pageOps.rotate(sel, 90)
    }, "\u21BB +90\xB0")), /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Semua halaman", "All pages")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(TDS.Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => ctx.pageOps.rotate(all, -90)
    }, "\u21BA ", TX(lang, "Semua", "All")), /*#__PURE__*/React.createElement(TDS.Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => ctx.pageOps.rotate(all, 90)
    }, "\u21BB ", TX(lang, "Semua", "All")))), /*#__PURE__*/React.createElement(TDS.Alert, {
      tone: "info"
    }, TX(lang, "Rotasi diterapkan permanen saat diproses.", "Rotation is applied permanently on process.")));
  },
  disabled: ctx => !ctx.pages.some(p => !p.deleted && p.rotation),
  outName: lang => TX(lang, "hasil-putar.pdf", "rotated.pdf"),
  process: (ctx, opts, onP, lang) => window.PdfProcess.assemble(ctx.pages, TOOL_DEFS.rotate.outName(lang), onP)
};
TOOL_DEFS.compress = {
  view: "preview",
  defaults: {
    level: "medium"
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts,
    ctx
  }) => {
    const totalIn = ctx.files.reduce((a, f) => a + f.size, 0);
    const factor = {
      low: 0.22,
      medium: 0.42,
      high: 0.68
    }[opts.level];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Tingkat kompresi", "Compression level")
    }, /*#__PURE__*/React.createElement(Segmented, {
      value: opts.level,
      onChange: level => setOpts({
        ...opts,
        level
      }),
      options: [{
        value: "low",
        label: TX(lang, "Kuat", "Strong")
      }, {
        value: "medium",
        label: TX(lang, "Seimbang", "Balanced")
      }, {
        value: "high",
        label: TX(lang, "Kualitas", "Quality")
      }]
    })), /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Perkiraan hasil", "Estimated result")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        font: "13px var(--font-mono)",
        color: "var(--text-heading)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        textDecoration: "line-through"
      }
    }, window.PdfEngine.fmtSize(totalIn, lang)), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        color: "var(--text-faint)"
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--status-success-fg)",
        fontWeight: 600
      }
    }, "\u2248 ", window.PdfEngine.fmtSize(totalIn * factor, lang)))), /*#__PURE__*/React.createElement(TDS.Alert, {
      tone: "warning"
    }, TX(lang, "Halaman dirender ulang sebagai gambar — teks tidak lagi dapat dipilih.", "Pages are re-rendered as images — text will no longer be selectable.")));
  },
  processLabel: (t, lang) => TX(lang, "Merender ulang halaman…", "Re-rendering pages…"),
  outName: lang => TX(lang, "hasil-kompres.pdf", "compressed.pdf"),
  process: (ctx, opts, onP, lang) => window.PdfProcess.compress(ctx.pages, opts, TOOL_DEFS.compress.outName(lang), onP)
};
Object.assign(window, {
  Field,
  Segmented,
  SliderRow,
  PosGrid,
  SelCount,
  TX,
  TOOL_DEFS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/tools-1.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/tools-2.jsx
try { (() => {
// PDFin workspace — tool defs part 2: watermark, images→PDF, PDF→image, page numbers, flatten.
const T2DS = window.PDFinDesignSystem_41a2ca;
const {
  Field,
  Segmented,
  SliderRow,
  PosGrid,
  TX,
  TOOL_DEFS
} = window;

// Anchor helper for CSS overlays (mirrors process.js anchor())
function cssAnchor(align) {
  const [v, h] = align.split("-");
  return {
    left: h === "left" ? "25%" : h === "right" ? "75%" : "50%",
    top: v === "top" ? "20%" : v === "bottom" ? "82%" : "50%"
  };
}
TOOL_DEFS.watermark = {
  view: "preview",
  multiFile: true,
  defaults: {
    kind: "text",
    text: "RAHASIA",
    opacity: 24,
    rotation: -35,
    size: 40,
    align: "middle-center",
    imageBytes: null,
    imageType: null,
    imageUrl: null
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts
  }) => {
    const imgRef = React.useRef(null);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Jenis watermark", "Watermark type")
    }, /*#__PURE__*/React.createElement(Segmented, {
      value: opts.kind,
      onChange: kind => setOpts({
        ...opts,
        kind
      }),
      options: [{
        value: "text",
        label: TX(lang, "Teks", "Text")
      }, {
        value: "image",
        label: TX(lang, "Gambar", "Image")
      }]
    })), opts.kind === "text" ? /*#__PURE__*/React.createElement(T2DS.Input, {
      label: TX(lang, "Teks", "Text"),
      value: opts.text,
      onChange: e => setOpts({
        ...opts,
        text: e.target.value
      })
    }) : /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "File gambar", "Image file")
    }, /*#__PURE__*/React.createElement(T2DS.Button, {
      variant: "secondary",
      size: "sm",
      onClick: () => imgRef.current.click()
    }, opts.imageUrl ? TX(lang, "Ganti gambar", "Replace image") : TX(lang, "Pilih gambar", "Choose image")), opts.imageUrl && /*#__PURE__*/React.createElement("img", {
      src: opts.imageUrl,
      alt: "",
      style: {
        width: 72,
        borderRadius: 6,
        border: "1px solid var(--border-default)"
      }
    }), /*#__PURE__*/React.createElement("input", {
      ref: imgRef,
      type: "file",
      accept: ".png,.jpg,.jpeg",
      style: {
        display: "none"
      },
      onChange: async e => {
        const f = e.target.files[0];
        if (!f) return;
        const bytes = new Uint8Array(await f.arrayBuffer());
        setOpts({
          ...opts,
          imageBytes: bytes,
          imageType: f.type,
          imageUrl: URL.createObjectURL(f)
        });
      }
    })), /*#__PURE__*/React.createElement(SliderRow, {
      label: TX(lang, "Opasitas", "Opacity"),
      value: opts.opacity,
      min: 5,
      max: 100,
      unit: "%",
      onChange: opacity => setOpts({
        ...opts,
        opacity
      })
    }), /*#__PURE__*/React.createElement(SliderRow, {
      label: TX(lang, "Rotasi", "Rotation"),
      value: opts.rotation,
      min: -90,
      max: 90,
      step: 5,
      unit: "\xB0",
      onChange: rotation => setOpts({
        ...opts,
        rotation
      })
    }), /*#__PURE__*/React.createElement(SliderRow, {
      label: TX(lang, "Ukuran", "Size"),
      value: opts.size,
      min: 10,
      max: 100,
      unit: "%",
      onChange: size => setOpts({
        ...opts,
        size
      })
    }), /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Penempatan", "Placement")
    }, /*#__PURE__*/React.createElement(PosGrid, {
      value: opts.align,
      onChange: align => setOpts({
        ...opts,
        align
      })
    })));
  },
  overlay: opts => (p, i) => {
    const pos = cssAnchor(opts.align);
    return /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: pos.left,
        top: pos.top,
        transform: `translate(-50%, -50%) rotate(${opts.rotation}deg)`,
        opacity: opts.opacity / 100,
        whiteSpace: "nowrap"
      }
    }, opts.kind === "text" ? /*#__PURE__*/React.createElement("span", {
      style: {
        font: `700 ${Math.max(10, opts.size * 1.5)}px/1 Helvetica, Arial, sans-serif`,
        color: "#6b6787",
        letterSpacing: "0.02em"
      }
    }, opts.text) : opts.imageUrl && /*#__PURE__*/React.createElement("img", {
      src: opts.imageUrl,
      alt: "",
      style: {
        width: `${opts.size * 4}px`
      }
    })));
  },
  disabled: (ctx, opts) => opts.kind === "text" ? !opts.text.trim() : !opts.imageBytes,
  process: (ctx, opts, onP) => window.PdfProcess.watermark(ctx.files, opts, onP)
};
TOOL_DEFS.img2pdf = {
  view: "grid",
  acceptImages: true,
  multiFile: true,
  allowReorderFiles: true,
  reorder: true,
  selectable: false,
  defaults: {
    pageSize: "a4",
    orientation: "portrait",
    margin: "small"
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts,
    ctx
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(T2DS.Select, {
    label: TX(lang, "Ukuran halaman", "Page size"),
    value: opts.pageSize,
    onChange: e => setOpts({
      ...opts,
      pageSize: e.target.value
    }),
    options: [{
      value: "a4",
      label: "A4"
    }, {
      value: "letter",
      label: "Letter"
    }, {
      value: "f4",
      label: "F4 (Folio)"
    }, {
      value: "fit",
      label: TX(lang, "Pas ukuran gambar", "Fit image")
    }]
  }), opts.pageSize !== "fit" && /*#__PURE__*/React.createElement(Field, {
    label: TX(lang, "Orientasi", "Orientation")
  }, /*#__PURE__*/React.createElement(Segmented, {
    value: opts.orientation,
    onChange: orientation => setOpts({
      ...opts,
      orientation
    }),
    options: [{
      value: "portrait",
      label: TX(lang, "Tegak", "Portrait")
    }, {
      value: "landscape",
      label: TX(lang, "Mendatar", "Landscape")
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: TX(lang, "Margin", "Margins")
  }, /*#__PURE__*/React.createElement(Segmented, {
    value: opts.margin,
    onChange: margin => setOpts({
      ...opts,
      margin
    }),
    options: [{
      value: "none",
      label: TX(lang, "Tanpa", "None")
    }, {
      value: "small",
      label: TX(lang, "Kecil", "Small")
    }, {
      value: "large",
      label: TX(lang, "Besar", "Large")
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: t.inspector.output
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "12.5px var(--font-mono)",
      color: "var(--text-muted)"
    }
  }, "1 PDF \xB7 ", ctx.files.length, " ", t.success.pages))),
  disabled: ctx => ctx.files.length === 0,
  outName: lang => TX(lang, "gambar-ke-pdf.pdf", "images.pdf"),
  process: (ctx, opts, onP, lang) => window.PdfProcess.imagesToPdf(ctx.files, opts, TOOL_DEFS.img2pdf.outName(lang), onP)
};
TOOL_DEFS.pdf2img = {
  view: "grid",
  selectable: true,
  defaults: {
    format: "png",
    dpi: 150,
    quality: 85
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts,
    ctx
  }) => {
    const live = ctx.pages.filter(p => !p.deleted);
    const n = ctx.selection.size || live.length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: TX(lang, "Format", "Format")
    }, /*#__PURE__*/React.createElement(Segmented, {
      value: opts.format,
      onChange: format => setOpts({
        ...opts,
        format
      }),
      options: [{
        value: "png",
        label: "PNG"
      }, {
        value: "jpeg",
        label: "JPG"
      }]
    })), /*#__PURE__*/React.createElement(T2DS.Select, {
      label: "DPI",
      value: String(opts.dpi),
      onChange: e => setOpts({
        ...opts,
        dpi: +e.target.value
      }),
      options: [{
        value: "72",
        label: "72 (layar)"
      }, {
        value: "150",
        label: "150"
      }, {
        value: "300",
        label: "300 (cetak)"
      }]
    }), opts.format === "jpeg" && /*#__PURE__*/React.createElement(SliderRow, {
      label: TX(lang, "Kualitas", "Quality"),
      value: opts.quality,
      min: 40,
      max: 100,
      unit: "%",
      onChange: quality => setOpts({
        ...opts,
        quality
      })
    }), /*#__PURE__*/React.createElement(Field, {
      label: t.inspector.output,
      hint: TX(lang, "Tanpa pilihan = semua halaman.", "No selection = all pages.")
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "12.5px var(--font-mono)",
        color: "var(--text-muted)"
      }
    }, n, " ", opts.format.toUpperCase())));
  },
  processLabel: (t, lang) => TX(lang, "Merender halaman…", "Rendering pages…"),
  process: (ctx, opts, onP, lang) => {
    const base = ctx.files[0] ? ctx.files[0].name.replace(/\.pdf$/i, "") : "halaman";
    return window.PdfProcess.pdfToImages(ctx.pages, {
      ...opts,
      selected: ctx.selection
    }, base, onP);
  }
};
TOOL_DEFS.pagenum = {
  view: "preview",
  multiFile: true,
  defaults: {
    position: "bottom-center",
    format: "n",
    font: "helvetica",
    fontSize: 11,
    color: "ink",
    margin: 28
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: TX(lang, "Posisi", "Position")
  }, /*#__PURE__*/React.createElement(PosGrid, {
    value: opts.position,
    onChange: position => setOpts({
      ...opts,
      position
    }),
    rows: ["top", "bottom"]
  })), /*#__PURE__*/React.createElement(T2DS.Select, {
    label: TX(lang, "Format", "Format"),
    value: opts.format,
    onChange: e => setOpts({
      ...opts,
      format: e.target.value
    }),
    options: [{
      value: "n",
      label: "1, 2, 3…"
    }, {
      value: "n_of_total",
      label: "1 / 24"
    }, {
      value: "page_n",
      label: TX(lang, "Halaman 1", "Page 1")
    }]
  }), /*#__PURE__*/React.createElement(T2DS.Select, {
    label: "Font",
    value: opts.font,
    onChange: e => setOpts({
      ...opts,
      font: e.target.value
    }),
    options: [{
      value: "helvetica",
      label: "Helvetica"
    }, {
      value: "times",
      label: "Times"
    }, {
      value: "courier",
      label: "Courier"
    }]
  }), /*#__PURE__*/React.createElement(SliderRow, {
    label: TX(lang, "Ukuran huruf", "Font size"),
    value: opts.fontSize,
    min: 8,
    max: 18,
    unit: "pt",
    onChange: fontSize => setOpts({
      ...opts,
      fontSize
    })
  }), /*#__PURE__*/React.createElement(SliderRow, {
    label: "Margin",
    value: opts.margin,
    min: 12,
    max: 64,
    unit: "pt",
    onChange: margin => setOpts({
      ...opts,
      margin
    })
  }), /*#__PURE__*/React.createElement(Field, {
    label: TX(lang, "Warna", "Color")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, [["ink", "#2B2740"], ["gray", "#8C88A0"], ["violet", "#5518B4"]].map(([v, hex]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    "aria-label": v,
    onClick: () => setOpts({
      ...opts,
      color: v
    }),
    style: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: hex,
      cursor: "pointer",
      border: opts.color === v ? "2px solid var(--action-primary)" : "1px solid var(--border-default)",
      outline: opts.color === v ? "2px solid var(--surface-card)" : "none",
      outlineOffset: -4
    }
  }))))),
  overlay: opts => (p, i) => {
    const colors = {
      ink: "#2B2740",
      gray: "#8C88A0",
      violet: "#5518B4"
    };
    const label = opts.format === "n_of_total" ? `${i + 1} / …` : opts.format === "page_n" ? `Halaman ${i + 1}` : String(i + 1);
    const fam = {
      helvetica: "Helvetica, Arial, sans-serif",
      times: "'Times New Roman', serif",
      courier: "'Courier New', monospace"
    }[opts.font];
    return /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        [opts.position.startsWith("top") ? "top" : "bottom"]: `${opts.margin / 842 * 100}%`,
        left: opts.position.endsWith("left") ? `${opts.margin / 595 * 100}%` : opts.position.endsWith("right") ? "auto" : "50%",
        right: opts.position.endsWith("right") ? `${opts.margin / 595 * 100}%` : "auto",
        transform: opts.position.endsWith("center") ? "translateX(-50%)" : "none",
        font: `${opts.fontSize * 1.4}px ${fam}`,
        color: colors[opts.color]
      }
    }, label));
  },
  process: (ctx, opts, onP) => window.PdfProcess.pageNumbers(ctx.files, opts, onP)
};
TOOL_DEFS.flatten = {
  view: "preview",
  multiFile: true,
  defaults: {
    forms: true,
    annotations: true
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(T2DS.Switch, {
    label: TX(lang, "Ratakan isian formulir", "Flatten form fields"),
    checked: opts.forms,
    onChange: forms => setOpts({
      ...opts,
      forms
    })
  }), /*#__PURE__*/React.createElement(T2DS.Switch, {
    label: TX(lang, "Ratakan anotasi", "Flatten annotations"),
    checked: opts.annotations,
    onChange: annotations => setOpts({
      ...opts,
      annotations
    })
  }), /*#__PURE__*/React.createElement(T2DS.Alert, {
    tone: "info",
    title: TX(lang, "Apa yang terjadi?", "What happens?")
  }, TX(lang, "Isian formulir dan anotasi menjadi bagian permanen halaman — tidak dapat diubah lagi setelah diratakan.", "Form fields and annotations become a permanent part of the page — they can no longer be edited after flattening."))),
  disabled: (ctx, opts) => !opts.forms && !opts.annotations,
  process: (ctx, opts, onP) => window.PdfProcess.flatten(ctx.files, opts, onP)
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/tools-2.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/tools-3.jsx
try { (() => {
// PDFin workspace — tool defs part 3: protect, unlock, metadata, sign, OCR.
const T3DS = window.PDFinDesignSystem_41a2ca;
const {
  Field: F3,
  Segmented: Seg3,
  SliderRow: SR3,
  TX: TX3,
  TOOL_DEFS: DEFS3
} = window;
function strength(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}
function StrengthMeter({
  pw,
  lang
}) {
  const s = strength(pw);
  const labels = lang === "id" ? ["Terlalu pendek", "Lemah", "Cukup", "Kuat", "Sangat kuat"] : ["Too short", "Weak", "Fair", "Strong", "Very strong"];
  const colors = ["var(--ink-300)", "var(--status-error-fg)", "var(--status-warning-fg)", "var(--status-success-fg)", "var(--status-success-fg)"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      background: i < s ? colors[s] : "var(--surface-sunken)",
      transition: "background var(--duration-fast) var(--ease-out)"
    }
  }))), pw && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "11px/1 var(--font-sans)",
      color: colors[s]
    }
  }, labels[s]));
}
DEFS3.protect = {
  view: "preview",
  simulated: true,
  defaults: {
    pw: "",
    pw2: "",
    printing: true,
    copying: false,
    editing: false
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(T3DS.Input, {
    type: "password",
    label: TX3(lang, "Kata sandi", "Password"),
    value: opts.pw,
    onChange: e => setOpts({
      ...opts,
      pw: e.target.value
    })
  }), /*#__PURE__*/React.createElement(StrengthMeter, {
    pw: opts.pw,
    lang: lang
  })), /*#__PURE__*/React.createElement(T3DS.Input, {
    type: "password",
    label: TX3(lang, "Ulangi kata sandi", "Repeat password"),
    value: opts.pw2,
    error: opts.pw2 && opts.pw2 !== opts.pw ? TX3(lang, "Kata sandi tidak sama.", "Passwords do not match.") : undefined,
    onChange: e => setOpts({
      ...opts,
      pw2: e.target.value
    })
  }), /*#__PURE__*/React.createElement(F3, {
    label: TX3(lang, "Izin dokumen", "Document permissions")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(T3DS.Switch, {
    label: TX3(lang, "Boleh dicetak", "Allow printing"),
    checked: opts.printing,
    onChange: printing => setOpts({
      ...opts,
      printing
    })
  }), /*#__PURE__*/React.createElement(T3DS.Switch, {
    label: TX3(lang, "Boleh disalin", "Allow copying"),
    checked: opts.copying,
    onChange: copying => setOpts({
      ...opts,
      copying
    })
  }), /*#__PURE__*/React.createElement(T3DS.Switch, {
    label: TX3(lang, "Boleh diubah", "Allow editing"),
    checked: opts.editing,
    onChange: editing => setOpts({
      ...opts,
      editing
    })
  }))), /*#__PURE__*/React.createElement(F3, {
    label: TX3(lang, "Ringkasan enkripsi", "Encryption summary")
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "12px var(--font-mono)",
      color: "var(--text-muted)"
    }
  }, "AES-256 \xB7 ", [opts.printing && TX3(lang, "cetak", "print"), opts.copying && TX3(lang, "salin", "copy"), opts.editing && TX3(lang, "ubah", "edit")].filter(Boolean).join(", ") || TX3(lang, "semua diblokir", "all blocked")))),
  disabled: (ctx, opts) => strength(opts.pw) < 1 || opts.pw !== opts.pw2,
  processLabel: (t, lang) => TX3(lang, "Mengenkripsi…", "Encrypting…"),
  process: (ctx, opts, onP) => window.PdfProcess.passthrough(ctx.files, "-terkunci", onP)
};
DEFS3.unlock = {
  view: "preview",
  simulated: true,
  defaults: {
    pw: ""
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(T3DS.Input, {
    type: "password",
    label: TX3(lang, "Kata sandi dokumen", "Document password"),
    value: opts.pw,
    hint: TX3(lang, "Kata sandi hanya dipakai di browser Anda.", "The password is only used inside your browser."),
    onChange: e => setOpts({
      ...opts,
      pw: e.target.value
    })
  }), /*#__PURE__*/React.createElement(T3DS.Alert, {
    tone: "info"
  }, TX3(lang, "PDFin membuka kunci file yang kata sandinya Anda ketahui — bukan alat pembobol.", "PDFin unlocks files whose password you already know — it is not a cracking tool."))),
  disabled: (ctx, opts) => opts.pw.length < 1,
  processLabel: (t, lang) => TX3(lang, "Memvalidasi kata sandi…", "Validating password…"),
  process: (ctx, opts, onP) => window.PdfProcess.passthrough(ctx.files, "-terbuka", onP)
};
DEFS3.metadata = {
  view: "preview",
  defaults: {
    title: "",
    author: "",
    subject: "",
    keywords: "",
    loadedFor: null
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts,
    ctx
  }) => {
    const fileId = ctx.files[0] && ctx.files[0].id;
    React.useEffect(() => {
      if (fileId && opts.loadedFor !== fileId) {
        window.PdfProcess.readMetadata(fileId).then(m => setOpts({
          ...opts,
          ...m,
          loadedFor: fileId
        }));
      }
    }, [fileId]);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(T3DS.Input, {
      label: TX3(lang, "Judul", "Title"),
      value: opts.title,
      onChange: e => setOpts({
        ...opts,
        title: e.target.value
      })
    }), /*#__PURE__*/React.createElement(T3DS.Input, {
      label: TX3(lang, "Penulis", "Author"),
      value: opts.author,
      onChange: e => setOpts({
        ...opts,
        author: e.target.value
      })
    }), /*#__PURE__*/React.createElement(T3DS.Input, {
      label: TX3(lang, "Subjek", "Subject"),
      value: opts.subject,
      onChange: e => setOpts({
        ...opts,
        subject: e.target.value
      })
    }), /*#__PURE__*/React.createElement(T3DS.Input, {
      label: TX3(lang, "Kata kunci", "Keywords"),
      value: opts.keywords,
      hint: TX3(lang, "Pisahkan dengan koma.", "Separate with commas."),
      onChange: e => setOpts({
        ...opts,
        keywords: e.target.value
      })
    }));
  },
  process: (ctx, opts, onP) => window.PdfProcess.metadata(ctx.files, opts, onP)
};

// ---- Sign: draw or type a signature, click a page to place, drag to move ----
function SignPad({
  lang,
  onChange
}) {
  const [tab, setTab] = React.useState("type");
  const [name, setName] = React.useState("");
  const canvasRef = React.useRef(null);
  const drawing = React.useRef(false);
  const exportCanvas = canvas => {
    canvas.toBlob(async blob => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      onChange({
        png: bytes,
        url: canvas.toDataURL("image/png")
      });
    }, "image/png");
  };
  const typeName = v => {
    setName(v);
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 200;
    const g = c.getContext("2d");
    g.fillStyle = "#1B1730";
    g.font = "italic 84px 'Segoe Script', 'Brush Script MT', cursive";
    g.textBaseline = "middle";
    g.fillText(v, 24, 100);
    if (v.trim()) exportCanvas(c);else onChange(null);
  };
  const pos = e => {
    const r = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvasRef.current.width / r.width),
      y: (e.clientY - r.top) * (canvasRef.current.height / r.height)
    };
  };
  const start = e => {
    drawing.current = true;
    const g = canvasRef.current.getContext("2d");
    const p = pos(e);
    g.beginPath();
    g.moveTo(p.x, p.y);
  };
  const move = e => {
    if (!drawing.current) return;
    const g = canvasRef.current.getContext("2d");
    g.strokeStyle = "#1B1730";
    g.lineWidth = 3.5;
    g.lineCap = "round";
    g.lineJoin = "round";
    const p = pos(e);
    g.lineTo(p.x, p.y);
    g.stroke();
  };
  const end = () => {
    if (drawing.current) {
      drawing.current = false;
      exportCanvas(canvasRef.current);
    }
  };
  const clear = () => {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    onChange(null);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Seg3, {
    value: tab,
    onChange: setTab,
    options: [{
      value: "type",
      label: TX3(lang, "Ketik", "Type")
    }, {
      value: "draw",
      label: TX3(lang, "Gambar", "Draw")
    }]
  }), tab === "type" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(T3DS.Input, {
    label: TX3(lang, "Nama", "Name"),
    value: name,
    onChange: e => typeName(e.target.value)
  }), name.trim() && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "italic 30px 'Segoe Script', 'Brush Script MT', cursive",
      color: "#1B1730"
    }
  }, name))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    width: 440,
    height: 180,
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: end,
    onPointerLeave: end,
    style: {
      width: "100%",
      height: 90,
      background: "#fff",
      border: "1px dashed var(--border-strong)",
      borderRadius: "var(--radius-md)",
      touchAction: "none",
      cursor: "crosshair"
    }
  }), /*#__PURE__*/React.createElement(T3DS.Button, {
    variant: "ghost",
    size: "sm",
    onClick: clear
  }, TX3(lang, "Bersihkan", "Clear"))));
}
DEFS3.sign = {
  view: "preview",
  defaults: {
    signaturePng: null,
    sigUrl: null,
    pageIndex: null,
    rect: {
      x: 0.55,
      y: 0.78,
      w: 0.28
    }
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(SignPad, {
    lang: lang,
    onChange: sig => setOpts({
      ...opts,
      signaturePng: sig && sig.png,
      sigUrl: sig && sig.url
    })
  }), /*#__PURE__*/React.createElement(SR3, {
    label: TX3(lang, "Lebar tanda tangan", "Signature width"),
    value: Math.round(opts.rect.w * 100),
    min: 10,
    max: 60,
    unit: "%",
    onChange: v => setOpts({
      ...opts,
      rect: {
        ...opts.rect,
        w: v / 100
      }
    })
  }), /*#__PURE__*/React.createElement(T3DS.Alert, {
    tone: opts.pageIndex == null ? "warning" : "info"
  }, opts.pageIndex == null ? TX3(lang, "Klik halaman di pratinjau untuk menempatkan tanda tangan.", "Click a page in the preview to place the signature.") : TX3(lang, `Ditempatkan di halaman ${opts.pageIndex + 1}. Tarik untuk memindahkan.`, `Placed on page ${opts.pageIndex + 1}. Drag to move.`))),
  overlay: (opts, setOpts) => (p, i) => /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (!opts.sigUrl) return;
      const r = e.currentTarget.getBoundingClientRect();
      setOpts({
        ...opts,
        pageIndex: i,
        rect: {
          ...opts.rect,
          x: Math.min(0.9, Math.max(0, (e.clientX - r.left) / r.width - opts.rect.w / 2)),
          y: Math.min(0.92, Math.max(0, (e.clientY - r.top) / r.height - 0.04))
        }
      });
    },
    style: {
      position: "absolute",
      inset: 0,
      cursor: opts.sigUrl ? "copy" : "default"
    }
  }, opts.pageIndex === i && opts.sigUrl && /*#__PURE__*/React.createElement("img", {
    src: opts.sigUrl,
    alt: "signature",
    draggable: false,
    onClick: e => e.stopPropagation(),
    onPointerDown: e => {
      e.preventDefault();
      e.stopPropagation();
      const pageEl = e.currentTarget.parentElement;
      const pr = pageEl.getBoundingClientRect();
      const startX = e.clientX,
        startY = e.clientY,
        o = {
          ...opts.rect
        };
      const onMove = ev => setOpts({
        ...opts,
        pageIndex: i,
        rect: {
          ...opts.rect,
          w: o.w,
          x: Math.min(0.95 - o.w, Math.max(0, o.x + (ev.clientX - startX) / pr.width)),
          y: Math.min(0.95, Math.max(0, o.y + (ev.clientY - startY) / pr.height))
        }
      });
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    style: {
      position: "absolute",
      left: `${opts.rect.x * 100}%`,
      top: `${opts.rect.y * 100}%`,
      width: `${opts.rect.w * 100}%`,
      cursor: "grab",
      outline: "1.5px dashed var(--border-brand)",
      outlineOffset: 4,
      borderRadius: 2
    }
  })),
  disabled: (ctx, opts) => !opts.signaturePng || opts.pageIndex == null,
  process: (ctx, opts, onP) => window.PdfProcess.sign(ctx.files, opts, onP)
};
DEFS3.ocr = {
  view: "grid",
  selectable: false,
  simulated: true,
  defaults: {
    language: "ind"
  },
  Panel: ({
    t,
    lang,
    opts,
    setOpts,
    ctx
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(T3DS.Select, {
    label: TX3(lang, "Bahasa dokumen", "Document language"),
    value: opts.language,
    onChange: e => setOpts({
      ...opts,
      language: e.target.value
    }),
    options: [{
      value: "ind",
      label: "Indonesia"
    }, {
      value: "eng",
      label: "English"
    }, {
      value: "ind+eng",
      label: "Indonesia + English"
    }]
  }), /*#__PURE__*/React.createElement(T3DS.Alert, {
    tone: "info"
  }, TX3(lang, "Teks hasil pindaian dikenali dan disisipkan sebagai lapisan yang dapat dicari — tampilan halaman tidak berubah.", "Scanned text is recognized and embedded as a searchable layer — the page appearance does not change."))),
  processLabel: (t, lang) => TX3(lang, "Mengenali teks…", "Recognizing text…"),
  process: (ctx, opts, onP) => window.PdfProcess.passthrough(ctx.files, "-ocr", onP, true)
};
Object.assign(window, {
  SignPad
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/tools-3.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/ws-shell.jsx
try { (() => {
// PDFin workspace — shell: icons, top nav, sidebar, inspector, empty/processing/success/error states, quick switcher.
const DS = window.PDFinDesignSystem_41a2ca;
const L = props => /*#__PURE__*/React.createElement("svg", {
  width: props.size || 18,
  height: props.size || 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, props.children);

// Lucide glyphs used across the workspace
const WSIcons = {
  merge: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "m8 6 4-4 4 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m20 22-5-5"
  })),
  split: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M16 3h5v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 3H3v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m15 9 6-6"
  })),
  organize: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "7",
    x: "3",
    y: "3",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "7",
    x: "14",
    y: "3",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "7",
    x: "14",
    y: "14",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "7",
    height: "7",
    x: "3",
    y: "14",
    rx: "1"
  })),
  rotate: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 3v5h-5"
  })),
  compress: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "4 14 10 14 10 20"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "20 10 14 10 14 4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "14",
    x2: "21",
    y1: "10",
    y2: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    x2: "10",
    y1: "21",
    y2: "14"
  })),
  watermark: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "4 7 4 4 20 4 20 7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    x2: "15",
    y1: "20",
    y2: "20"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "12",
    y1: "4",
    y2: "20"
  })),
  img2pdf: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "18",
    x: "3",
    y: "3",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "9",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
  })),
  pdf2img: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 22H4a2 2 0 0 1-2-2V6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "16",
    height: "16",
    x: "6",
    y: "2",
    rx: "2"
  })),
  pagenum: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    x2: "20",
    y1: "9",
    y2: "9"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    x2: "20",
    y1: "15",
    y2: "15"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    x2: "8",
    y1: "3",
    y2: "21"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    x2: "14",
    y1: "3",
    y2: "21"
  })),
  flatten: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"
  })),
  protect: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "11",
    x: "3",
    y: "11",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11V7a5 5 0 0 1 10 0v4"
  })),
  unlock: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "11",
    x: "3",
    y: "11",
    rx: "2",
    ry: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11V7a5 5 0 0 1 9.9-1"
  })),
  metadata: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2v4a2 2 0 0 0 2 2h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 9H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 13H8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 17H8"
  })),
  sign: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 20h9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
  })),
  ocr: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 7V5a2 2 0 0 1 2-2h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 3h2a2 2 0 0 1 2 2v2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 17v2a2 2 0 0 1-2 2h-2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 21H5a2 2 0 0 1-2-2v-2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 8h8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 12h10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 16h6"
  })),
  chevDown: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  })),
  search: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  plus: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })),
  download: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
  })),
  check: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })),
  sparkle: s => /*#__PURE__*/React.createElement(L, {
    size: s
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
  }))
};
const toolIcon = (id, s) => (WSIcons[id] || WSIcons.merge)(s);

// ---------- Top navigation ----------
function WorkspaceTopNav({
  t,
  tool,
  lang,
  setLang,
  theme,
  setTheme,
  onOpenSwitcher
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 56,
      background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-default)",
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 16px",
      position: "relative",
      zIndex: 20,
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      textDecoration: "none",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../../assets/logo/pdfin-mark-64.png",
    alt: "PDFin",
    style: {
      width: 26,
      height: 26
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-extrabold) 17px/1 var(--font-sans)",
      letterSpacing: "-0.02em",
      color: "var(--text-heading)"
    }
  }, "PDF", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-brand)"
    }
  }, "in")))), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-muted)"
    }
  }, t.breadcrumbTools), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: "var(--text-faint)",
      font: "var(--type-body-sm)"
    }
  }, "/"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onOpenSwitcher,
    title: t.quickSwitchHint,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "6px 10px",
      border: "none",
      borderRadius: "var(--radius-md)",
      background: "transparent",
      cursor: "pointer",
      font: "var(--weight-semibold) 14px/1 var(--font-sans)",
      color: "var(--text-heading)"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--surface-sunken)",
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      color: "var(--text-brand)"
    }
  }, toolIcon(tool, 16)), t.toolNames[tool], WSIcons.chevDown(14)), /*#__PURE__*/React.createElement("kbd", {
    style: {
      font: "10.5px var(--font-mono)",
      color: "var(--text-faint)",
      border: "1px solid var(--border-default)",
      borderRadius: 5,
      padding: "3px 6px"
    }
  }, "Ctrl K")), /*#__PURE__*/React.createElement(DS.LangSwitcher, {
    lang: lang,
    onChange: setLang
  }), /*#__PURE__*/React.createElement(DS.IconButton, {
    label: theme === "dark" ? "Light mode" : "Dark mode",
    onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    icon: theme === "dark" ? /*#__PURE__*/React.createElement(L, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
    })) : /*#__PURE__*/React.createElement(L, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"
    }))
  }));
}

// ---------- Quick switcher (Ctrl+K) ----------
function QuickSwitcher({
  t,
  toolIds,
  current,
  onPick,
  onClose
}) {
  const [q, setQ] = React.useState("");
  const [hi, setHi] = React.useState(0);
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);
  const list = toolIds.filter(id => (t.toolNames[id] + " " + t.toolDesc[id]).toLowerCase().includes(q.toLowerCase()));
  React.useEffect(() => {
    setHi(0);
  }, [q]);
  const onKey = e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi(h => Math.min(list.length - 1, h + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi(h => Math.max(0, h - 1));
    }
    if (e.key === "Enter" && list[hi]) {
      onPick(list[hi]);
    }
    if (e.key === "Escape") onClose();
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    },
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(18,15,34,0.45)",
      zIndex: 100,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingTop: "12vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-label": t.allTools,
    style: {
      width: 520,
      maxHeight: "62vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "0 24px 64px rgba(18,15,34,0.3)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "14px 16px",
      borderBottom: "1px solid var(--border-default)",
      color: "var(--text-muted)"
    }
  }, WSIcons.search(17), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    value: q,
    onChange: e => setQ(e.target.value),
    onKeyDown: onKey,
    placeholder: t.searchTools,
    "aria-label": t.searchTools,
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "15px/1.4 var(--font-sans)",
      color: "var(--text-heading)"
    }
  }), /*#__PURE__*/React.createElement("kbd", {
    style: {
      font: "10.5px var(--font-mono)",
      color: "var(--text-faint)",
      border: "1px solid var(--border-default)",
      borderRadius: 5,
      padding: "3px 6px"
    }
  }, "Esc")), /*#__PURE__*/React.createElement("div", {
    role: "listbox",
    style: {
      overflow: "auto",
      padding: 6
    }
  }, list.map((id, i) => /*#__PURE__*/React.createElement("button", {
    key: id,
    type: "button",
    role: "option",
    "aria-selected": i === hi,
    onClick: () => onPick(id),
    onMouseEnter: () => setHi(i),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      padding: "9px 10px",
      border: "none",
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      textAlign: "left",
      background: i === hi ? "var(--surface-brand-subtle)" : "transparent"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 34,
      height: 34,
      flex: "none",
      borderRadius: 10,
      background: "var(--surface-brand-subtle)",
      color: "var(--text-brand)"
    }
  }, toolIcon(id, 17)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-semibold) 13.5px/1.3 var(--font-sans)",
      color: "var(--text-heading)"
    }
  }, t.toolNames[id], id === current && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-faint)",
      fontWeight: 400
    }
  }, " \u2014 ", t.breadcrumbHome === "Beranda" ? "sedang dibuka" : "current")), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "12px/1.4 var(--font-sans)",
      color: "var(--text-muted)"
    }
  }, t.toolDesc[id])))), !list.length && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18,
      font: "var(--type-body-sm)",
      color: "var(--text-muted)",
      textAlign: "center"
    }
  }, t.noToolMatch))));
}

// ---------- Empty state ----------
function EmptyState({
  t,
  tool,
  onFiles,
  onSample,
  acceptImages,
  busy
}) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);
  const accept = acceptImages ? "image/png,image/jpeg" : "application/pdf";
  const handle = fileList => {
    const arr = [...fileList].filter(f => accept.includes(f.type) || !acceptImages && f.name.toLowerCase().endsWith(".pdf"));
    if (arr.length) onFiles(arr);
  };
  React.useEffect(() => {
    const onPaste = e => {
      if (e.clipboardData && e.clipboardData.files.length) handle(e.clipboardData.files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 560,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 18,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 56,
      height: 56,
      borderRadius: 16,
      background: "var(--surface-brand-subtle)",
      color: "var(--text-brand)"
    }
  }, toolIcon(tool, 26)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--weight-bold) 22px/1.25 var(--font-sans)",
      letterSpacing: "-0.02em",
      color: "var(--text-heading)",
      margin: 0
    }
  }, t.toolNames[tool]), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-muted)",
      margin: 0,
      maxWidth: 420
    }
  }, t.toolDesc[tool])), /*#__PURE__*/React.createElement("div", {
    onDragOver: e => {
      e.preventDefault();
      setDrag(true);
    },
    onDragLeave: () => setDrag(false),
    onDrop: e => {
      e.preventDefault();
      setDrag(false);
      handle(e.dataTransfer.files);
    },
    style: {
      width: "100%",
      padding: "38px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      border: `2px dashed ${drag ? "var(--border-brand)" : "var(--border-strong)"}`,
      borderRadius: "var(--radius-lg)",
      background: drag ? "var(--surface-brand-subtle)" : "var(--gradient-brand-soft)",
      transition: "background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-brand)"
    }
  }, /*#__PURE__*/React.createElement(L, {
    size: 26
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 8l-5-5-5 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3v12"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-semibold) 15px/1.3 var(--font-sans)",
      color: "var(--text-heading)"
    }
  }, t.drop.title), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, t.empty.hintKeyboard), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "primary",
    onClick: () => inputRef.current && inputRef.current.click(),
    disabled: busy
  }, t.drop.browse), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "ghost",
    size: "sm",
    onClick: onSample,
    disabled: busy,
    icon: WSIcons.sparkle(15)
  }, t.sidebar.sample)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "11.5px var(--font-mono)",
      color: "var(--text-faint)",
      marginTop: 2
    }
  }, acceptImages ? t.drop.typesImg : t.drop.types), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: acceptImages ? ".png,.jpg,.jpeg" : ".pdf",
    multiple: true,
    style: {
      display: "none"
    },
    onChange: e => {
      handle(e.target.files);
      e.target.value = "";
    }
  })), /*#__PURE__*/React.createElement(DS.PrivacyPill, {
    lang: t === window.PDFIN_T.id ? "id" : "en"
  })));
}

// ---------- Processing / success / error ----------
function ProcessingView({
  t,
  progress,
  label,
  onCancel
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 32
    }
  }, /*#__PURE__*/React.createElement(DS.Card, {
    style: {
      width: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(DS.ProgressBar, {
    value: progress,
    label: label || t.stage.processing
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, t.privacy), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "ghost",
    size: "sm",
    onClick: onCancel
  }, t.stage.cancel)))));
}
function SuccessView({
  t,
  result,
  onDownload,
  onDownloadAll,
  onRestart,
  onBack,
  note
}) {
  const total = result.outputs.reduce((a, o) => a + o.size, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 520,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ws-pop",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: "var(--status-success-bg)",
      color: "var(--status-success-fg)"
    }
  }, WSIcons.check(28)), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--weight-bold) 20px/1.3 var(--font-sans)",
      letterSpacing: "-0.02em",
      color: "var(--text-heading)",
      margin: 0
    }
  }, t.stage.done), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, t.success.size, ": ", /*#__PURE__*/React.createElement("span", {
    style: {
      font: "11.5px var(--font-mono)"
    }
  }, window.PdfEngine.fmtSize(total, "id")), " · ", t.success.time, ": ", /*#__PURE__*/React.createElement("span", {
    style: {
      font: "11.5px var(--font-mono)"
    }
  }, (result.ms / 1000).toFixed(1), "s")), note && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--status-warning-fg)",
      background: "var(--status-warning-bg)",
      padding: "4px 10px",
      borderRadius: 999
    }
  }, note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      maxHeight: 300,
      overflow: "auto"
    }
  }, result.outputs.slice(0, 20).map((o, i) => /*#__PURE__*/React.createElement(DS.DownloadCard, {
    key: i,
    name: o.name,
    downloadLabel: t.stage.download,
    meta: window.PdfEngine.fmtSize(o.size, "id") + (o.pages ? ` · ${o.pages} ${t.success.pages}` : ""),
    onDownload: () => onDownload(o)
  })), result.outputs.length > 20 && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)",
      textAlign: "center"
    }
  }, "+", result.outputs.length - 20)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 10
    }
  }, result.outputs.length > 1 && /*#__PURE__*/React.createElement(DS.Button, {
    variant: "primary",
    icon: WSIcons.download(16),
    onClick: onDownloadAll
  }, t.stage.downloadAll), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "secondary",
    onClick: onBack
  }, t.stage.back), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "ghost",
    onClick: onRestart
  }, t.stage.restart))));
}
function ErrorView({
  t,
  message,
  onRetry,
  onRestart
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 420,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "var(--status-error-bg)",
      color: "var(--status-error-fg)"
    }
  }, /*#__PURE__*/React.createElement(L, {
    size: 24
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m15 9-6 6M9 9l6 6"
  }))), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--weight-bold) 18px/1.3 var(--font-sans)",
      color: "var(--text-heading)",
      margin: 0
    }
  }, t.error.title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-muted)",
      margin: 0
    }
  }, message || t.error.body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(DS.Button, {
    variant: "primary",
    onClick: onRetry
  }, t.error.retry), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "ghost",
    onClick: onRestart
  }, t.stage.restart))));
}
Object.assign(window, {
  WSIcons,
  toolIcon,
  WorkspaceTopNav,
  QuickSwitcher,
  EmptyState,
  ProcessingView,
  SuccessView,
  ErrorView
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/ws-shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdfin-web/workspace/ws-views.jsx
try { (() => {
// PDFin workspace — sidebar, lazy thumbnails, page grid, document preview.
const VDS = window.PDFinDesignSystem_41a2ca;

// Render a PDF page canvas lazily when scrolled into view. Canvases are cached in the engine.
function LazyThumb({
  fileId,
  pageNo,
  width,
  style
}) {
  const holder = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setVisible(true)), {
      rootMargin: "400px"
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  React.useEffect(() => {
    let dead = false;
    if (!visible) return;
    window.PdfEngine.renderPage(fileId, pageNo, width).then(canvas => {
      if (dead || !canvas || !holder.current) return;
      holder.current.innerHTML = "";
      holder.current.appendChild(canvas);
    });
    return () => {
      dead = true;
    };
  }, [visible, fileId, pageNo, width]);
  return /*#__PURE__*/React.createElement("div", {
    ref: holder,
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      background: "#fff",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ws-shimmer",
    style: {
      width: "70%",
      height: "80%",
      borderRadius: 4
    }
  }));
}

// ---------- Left sidebar ----------
function Sidebar({
  t,
  lang,
  files,
  onAdd,
  onSample,
  onRemove,
  onMoveFile,
  recent,
  stage,
  progress,
  acceptImages,
  allowReorder
}) {
  const inputRef = React.useRef(null);
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 248,
      flex: "none",
      borderRight: "1px solid var(--border-default)",
      background: "var(--surface-card)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--weight-semibold) 11.5px/1 var(--font-sans)",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-faint)",
      margin: 0
    }
  }, t.sidebar.files), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => inputRef.current && inputRef.current.click(),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      border: "none",
      background: "transparent",
      color: "var(--text-brand)",
      font: "var(--weight-semibold) 12px/1 var(--font-sans)",
      cursor: "pointer",
      padding: "4px 6px",
      borderRadius: 6
    }
  }, window.WSIcons.plus(13), t.sidebar.addFile), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: acceptImages ? ".png,.jpg,.jpeg" : ".pdf",
    multiple: true,
    style: {
      display: "none"
    },
    onChange: e => {
      onAdd([...e.target.files]);
      e.target.value = "";
    }
  })), files.length === 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSample,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 12px",
      borderRadius: "var(--radius-md)",
      border: "1px dashed var(--border-strong)",
      background: "transparent",
      color: "var(--text-muted)",
      font: "12.5px/1.4 var(--font-sans)",
      cursor: "pointer",
      textAlign: "left"
    }
  }, window.WSIcons.sparkle(14), t.sidebar.sample), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, files.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: f.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 8px",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 38,
      flex: "none",
      border: "1px solid var(--border-default)",
      borderRadius: 4,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(LazyThumb, {
    fileId: f.id,
    pageNo: 1,
    width: 30
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-medium) 11.5px/1.3 var(--font-mono)",
      color: "var(--text-heading)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, f.name), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "10.5px/1 var(--font-sans)",
      color: "var(--text-muted)"
    }
  }, window.PdfEngine.fmtSize(f.size, lang), " \xB7 ", f.pageCount, " ", t.success.pages)), allowReorder && files.length > 1 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(ArrowBtn, {
    dir: "up",
    disabled: i === 0,
    onClick: () => onMoveFile(i, i - 1)
  }), /*#__PURE__*/React.createElement(ArrowBtn, {
    dir: "down",
    disabled: i === files.length - 1,
    onClick: () => onMoveFile(i, i + 1)
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": t.sidebar.remove,
    onClick: () => onRemove(f.id),
    style: {
      display: "flex",
      border: "none",
      background: "transparent",
      color: "var(--text-faint)",
      cursor: "pointer",
      padding: 3,
      borderRadius: 5
    },
    onMouseEnter: e => e.currentTarget.style.color = "var(--status-error-fg)",
    onMouseLeave: e => e.currentTarget.style.color = "var(--text-faint)"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))))))), stage === "processing" && /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--weight-semibold) 11.5px/1 var(--font-sans)",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-faint)",
      margin: 0
    }
  }, t.sidebar.queue), /*#__PURE__*/React.createElement(VDS.ProgressBar, {
    value: progress
  })), recent.length > 0 && files.length === 0 && /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--weight-semibold) 11.5px/1 var(--font-sans)",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-faint)",
      margin: 0
    }
  }, t.sidebar.recent), recent.slice(0, 4).map((r, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      font: "11.5px/1.4 var(--font-mono)",
      color: "var(--text-muted)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, r)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      borderTop: "1px solid var(--border-default)",
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--weight-semibold) 11.5px/1 var(--font-sans)",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-faint)",
      margin: "0 0 2px"
    }
  }, t.sidebar.shortcuts), t.shortcuts.slice(0, 5).map(([k, label]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("kbd", {
    style: {
      font: "10px var(--font-mono)",
      color: "var(--text-muted)",
      border: "1px solid var(--border-default)",
      borderRadius: 4,
      padding: "2px 5px",
      minWidth: 34,
      textAlign: "center"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "11.5px/1 var(--font-sans)",
      color: "var(--text-muted)"
    }
  }, label)))));
}
function ArrowBtn({
  dir,
  disabled,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": dir,
    disabled: disabled,
    onClick: onClick,
    style: {
      display: "flex",
      border: "none",
      background: "transparent",
      color: "var(--text-faint)",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.3 : 1,
      padding: "1px 2px"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, dir === "up" ? /*#__PURE__*/React.createElement("path", {
    d: "m18 15-6-6-6 6"
  }) : /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  })));
}

// ---------- Page grid (thumbnails, selection, drag reorder, context menu) ----------
function PageGrid({
  t,
  pages,
  selection,
  setSelection,
  cardWidth = 148,
  onReorder,
  onRotate,
  onDelete,
  onDuplicate,
  selectable = true,
  badges
}) {
  const [menu, setMenu] = React.useState(null); // {x, y, uid}
  const dragFrom = React.useRef(null);
  const [dropAt, setDropAt] = React.useState(null);
  const live = pages.filter(p => !p.deleted);
  const toggle = (uid, e) => {
    if (!selectable) return;
    setSelection(sel => {
      const next = new Set(e && (e.metaKey || e.ctrlKey || e.shiftKey) || true ? sel : []);
      if (next.has(uid)) next.delete(uid);else next.add(uid);
      return next;
    });
  };
  React.useEffect(() => {
    if (!selectable) return;
    const onKey = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelection(new Set(live.map(p => p.uid)));
      }
      if (e.key === "Escape") setSelection(new Set());
      if (e.key.toLowerCase() === "r" && onRotate && selection.size) {
        e.preventDefault();
        onRotate([...selection], 90);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && onDelete && selection.size) {
        e.preventDefault();
        onDelete([...selection]);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selection, live.length, selectable]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: "20px 24px"
    },
    onClick: e => {
      if (e.target === e.currentTarget && selectable) setSelection(new Set());
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      alignContent: "flex-start"
    },
    role: "listbox",
    "aria-multiselectable": "true"
  }, live.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.uid,
    draggable: !!onReorder,
    onDragStart: () => {
      dragFrom.current = i;
    },
    onDragOver: e => {
      if (onReorder) {
        e.preventDefault();
        setDropAt(i);
      }
    },
    onDrop: e => {
      e.preventDefault();
      if (onReorder && dragFrom.current != null && dragFrom.current !== i) onReorder(dragFrom.current, i);
      dragFrom.current = null;
      setDropAt(null);
    },
    onDragEnd: () => {
      dragFrom.current = null;
      setDropAt(null);
    },
    style: {
      position: "relative",
      outline: dropAt === i && dragFrom.current !== i ? "2px solid var(--cyan-400)" : "none",
      outlineOffset: 3,
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement(VDS.PageCard, {
    pageNumber: i + 1,
    width: cardWidth,
    selected: selection.has(p.uid),
    rotation: p.rotation,
    badge: badges ? badges(p, i) : p.rotation ? /*#__PURE__*/React.createElement(VDS.Badge, {
      tone: "brand"
    }, p.rotation, "\xB0") : null,
    onClick: e => toggle(p.uid, e),
    onContextMenu: e => {
      e.preventDefault();
      setMenu({
        x: e.clientX,
        y: e.clientY,
        uid: p.uid
      });
    }
  }, /*#__PURE__*/React.createElement(LazyThumb, {
    fileId: p.fileId,
    pageNo: p.srcIndex + 1,
    width: cardWidth
  }))))), menu && (onRotate || onDelete || onDuplicate) && /*#__PURE__*/React.createElement(VDS.ContextMenu, {
    x: menu.x,
    y: menu.y,
    onClose: () => setMenu(null),
    items: [onRotate && {
      label: t.pageMenu.rotateR,
      shortcut: "R",
      icon: window.WSIcons.rotate(15),
      onSelect: () => onRotate([menu.uid], 90)
    }, onRotate && {
      label: t.pageMenu.rotateL,
      icon: window.WSIcons.rotate(15),
      onSelect: () => onRotate([menu.uid], -90)
    }, onDuplicate && {
      label: t.pageMenu.duplicate,
      shortcut: "Ctrl+D",
      onSelect: () => onDuplicate([menu.uid])
    }, onDelete && "divider", onDelete && {
      label: t.pageMenu.delete,
      shortcut: "Del",
      danger: true,
      onSelect: () => onDelete([menu.uid])
    }].filter(Boolean)
  }));
}

// ---------- Continuous document preview with zoom + floating toolbar + per-page overlay ----------
function DocPreview({
  t,
  pages,
  overlay,
  children
}) {
  const [zoom, setZoom] = React.useState(100);
  const [page, setPage] = React.useState(1);
  const scroller = React.useRef(null);
  const live = pages.filter(p => !p.deleted);
  const baseW = 620;
  const w = baseW * zoom / 100;
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const kids = el.querySelectorAll("[data-pv-page]");
    let best = 1,
      bestDist = Infinity;
    kids.forEach(k => {
      const r = k.getBoundingClientRect();
      const mid = r.top + r.height / 2 - el.getBoundingClientRect().top;
      const d = Math.abs(mid - el.clientHeight / 2);
      if (d < bestDist) {
        bestDist = d;
        best = +k.dataset.pvPage;
      }
    });
    setPage(best);
  };
  const goTo = n => {
    const el = scroller.current;
    const target = el && el.querySelector(`[data-pv-page="${n}"]`);
    if (target && el) el.scrollTo({
      top: target.offsetTop - 16,
      behavior: "smooth"
    });
    setPage(n);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: "relative",
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: scroller,
    onScroll: onScroll,
    style: {
      flex: 1,
      overflow: "auto",
      padding: "24px 24px 90px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20
    }
  }, live.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.uid,
    "data-pv-page": i + 1,
    style: {
      width: w,
      maxWidth: "100%",
      position: "relative",
      background: "#fff",
      border: "1px solid var(--border-default)",
      borderRadius: 4,
      boxShadow: "var(--shadow-card)",
      transform: p.rotation ? `rotate(${p.rotation}deg)` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "210 / 297"
    }
  }, /*#__PURE__*/React.createElement(LazyThumb, {
    fileId: p.fileId,
    pageNo: p.srcIndex + 1,
    width: Math.min(w, 900)
  })), overlay && overlay(p, i)))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 18,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(VDS.Toolbar, null, /*#__PURE__*/React.createElement(VDS.ZoomControl, {
    value: zoom,
    onZoomIn: () => setZoom(z => Math.min(220, z + 20)),
    onZoomOut: () => setZoom(z => Math.max(40, z - 20)),
    onReset: () => setZoom(100)
  }), /*#__PURE__*/React.createElement(VDS.ToolbarDivider, null), /*#__PURE__*/React.createElement(VDS.PageNavigator, {
    page: page,
    count: live.length,
    onChange: goTo
  }), children)));
}
Object.assign(window, {
  LazyThumb,
  Sidebar,
  PageGrid,
  DocPreview
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdfin-web/workspace/ws-views.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Dropzone = __ds_scope.Dropzone;

__ds_ns.FileCard = __ds_scope.FileCard;

__ds_ns.LangSwitcher = __ds_scope.LangSwitcher;

__ds_ns.PrivacyPill = __ds_scope.PrivacyPill;

__ds_ns.ToolTile = __ds_scope.ToolTile;

__ds_ns.ContextMenu = __ds_scope.ContextMenu;

__ds_ns.DownloadCard = __ds_scope.DownloadCard;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.PageCard = __ds_scope.PageCard;

__ds_ns.PageNavigator = __ds_scope.PageNavigator;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Toolbar = __ds_scope.Toolbar;

__ds_ns.ToolbarDivider = __ds_scope.ToolbarDivider;

__ds_ns.ZoomControl = __ds_scope.ZoomControl;

})();
