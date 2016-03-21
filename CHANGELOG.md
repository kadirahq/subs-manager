# Change Log

### v1.6.4
2016-March-21

* Fix minor typo in the code related to cacheMap.

### v1.6.3

* Fix failing tests.
* Update documentation.

### v1.6.2

* the feature of `subs.ready() === false` at initially causing SSR to not work properly. This version fix that. 

### v1.6.1

* Add reactive changes related improvements
 - Make subs.ready() === false if there is no subs inside the subscription
 - Fire dep.changed() very carefully to avoid reactive loops

### v1.6.0

* Add gloabl `.ready()` api where we check the ready status of the whole subsManager at anytime.

### v1.4.0

IE8 Compatibility
