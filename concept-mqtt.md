WB diagnostics implementation concept - MQTT
============================================

Поговорим о транспорте для диагностик.

В Wiren Board всё принято делать через MQTT, потому что это неплохой
протокол для обмена сообщениями, в нём есть древовидная структура топиков, 
QoS и в этот протокол умеет целая куча софта, в том числе для удалённого 
мониторинга и сбора метрик.

Почему **удобно** использовать иерархию топиков MQTT для диагностик:

 * Не надо изобретать механизмы фильтрации для выбора конкретных
   диагностик;
 * Нужные диагностики можно быстро прокидывать на удалённые сервера тем же
   путём, которым идут обычные данные с контроллера;

Почему **неудобно** использовать иерархию топиков MQTT для диагностик:

 * К сервису с историческими данными диагностик придётся прикручивать такой
   же механизм wildcard, как в mqtt/mosquitto.
   (Хорошо, если мы найдём готовую реализацию,
   соответствующую стандарту, сделанную отдельно от брокера. Если нет - у
   нас будет два механизма wildcard, которые будут работать потенциально
   неодинаково, и это будет неприятно);
 * Службы диагностики могут перегрузить и без того загруженный в некоторых
   проектах брокер (в частности, потому что сервисы будут подписываться на
   `/diag/#`, нужно будет следить за message rate-ом там);
 * Если захотим аггрегацию диагностик по категориям на уровне сервера
   (то есть, сообщения со статусом ok/warn/error/mixed для категорий, а
   не только для диагностик), то придётся делать их отдельным сервисом.

Что нужно будет доделать:

 * сервис - аналог wb-history для хранения логов
   (см. [concept-systemd.md](concept-systemd.md))
