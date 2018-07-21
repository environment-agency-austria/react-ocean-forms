# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
- Fixed a bug where the state of an unmounted Field has been set

## [1.1.1] # 2018-07-02
- Fixed a bug where getDisplayValue wasn't called when the form plaintext or disabled state changed

## [1.1.0] # 2018-06-27
- Changed listener logic of the form context to make it usable in more use cases:
  - context.registerListener now needs a callback function as second parameter
  - the listener callback will be called with fieldName, eventName and eventArgs (added eventName)
- Added onChange and onBlur callback to Field
- Added className to Form, which will be mapped to the html form
- Added plaintext mode to Form, which only displays the plaintext value
- Added getDisplayValue and getSubmitValue lifecycle hooks to Field

## [1.0.3] # 2018-06-11
- Initial release of the current code base
