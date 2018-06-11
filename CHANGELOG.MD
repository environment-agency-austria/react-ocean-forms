# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
- Changed listener logic of the form context to make it usable in more use cases:
  - context.registerListener now needs a callback function as second parameter
  - the listener callback will be called with fieldName, eventName and eventArgs (added eventName)

## [1.0.3] # 2018-06-11
- Initial release of the current code base
