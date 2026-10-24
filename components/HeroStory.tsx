/**
 * Иллюстрация процесса: разрозненные материалы → изучение врачом → структурированный результат.
 * Документы — демонстрационные и подписаны так. Никакой «автоматической диагностики»:
 * второй этап — человек-врач, а не алгоритм.
 * Анимация на CSS (transform/opacity), пауза вне экрана через data-playing, см. Motion.tsx.
 */
export function HeroStory() {
  return (
    <figure className="story" data-anim aria-labelledby="story-cap">
      <div className="story-stage" aria-hidden="true">
        <div className="doc doc-a">
          <span className="doc-kicker">Выписка</span>
          <span className="doc-line w80" />
          <span className="doc-line w60" />
          <span className="doc-line w70" />
          <span className="doc-line w40" />
        </div>
        <div className="doc doc-b">
          <span className="doc-kicker">Анализ крови</span>
          <span className="doc-row">
            <i>СРБ</i>
            <b className="mark">↑</b>
          </span>
          <span className="doc-row">
            <i>Лейкоциты</i>
            <b />
          </span>
          <span className="doc-row">
            <i>Креатинин</i>
            <b />
          </span>
        </div>
        <div className="doc doc-c">
          <span className="doc-kicker">Рентген · DICOM</span>
          <span className="xray" />
        </div>

        <div className="reader">
          <span className="reader-dot" />
          <span>Врач изучает материалы</span>
        </div>

        <div className="result">
          <span className="doc-kicker">Заключение</span>
          <ol>
            <li>
              <b>Рассмотрено</b>
              <span className="doc-line w70" />
            </li>
            <li>
              <b>Выводы</b>
              <span className="doc-line w80" />
            </li>
            <li>
              <b>Ограничения данных</b>
              <span className="doc-line w50" />
            </li>
            <li>
              <b>Вопросы лечащему врачу</b>
              <span className="doc-line w60" />
            </li>
          </ol>
          <span className="sign">Подпись врача</span>
        </div>
      </div>
      <figcaption id="story-cap" className="story-cap">
        <ol>
          <li>
            <span>1</span>Выписка, анализы и обследования
          </li>
          <li>
            <span>2</span>Изучение материалов врачом
          </li>
          <li>
            <span>3</span>Структурированное заключение
          </li>
        </ol>
        <p className="demo-label">Схема процесса на демонстрационных документах — не реальный пациент.</p>
      </figcaption>
    </figure>
  );
}
