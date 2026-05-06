CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    login         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
    movie_id     SERIAL PRIMARY KEY,
    title_orig   VARCHAR(255) NOT NULL,
    title_ru     VARCHAR(255),
    describe_ru  TEXT,
    describe_eng TEXT,
    poster_path  VARCHAR(500),
    year         SMALLINT,
    country      VARCHAR(100),
    duration     SMALLINT
);

CREATE TABLE IF NOT EXISTS genres (
    genre_id SERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS movie_genres (
    movie_genre_id SERIAL PRIMARY KEY,
    movie_id       INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    genre_id       INTEGER NOT NULL REFERENCES genres(genre_id) ON DELETE CASCADE,
    UNIQUE(movie_id, genre_id)
);

CREATE TABLE IF NOT EXISTS video_files (
    video_file_id SERIAL PRIMARY KEY,
    movie_id      INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    quality       VARCHAR(20),
    video_path    VARCHAR(500) NOT NULL,
    format        VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS subtitles (
    subtitle_id   SERIAL PRIMARY KEY,
    movie_id      INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    subtitle_path VARCHAR(500) NOT NULL,
    format        VARCHAR(20),
    UNIQUE(movie_id, language_code)
);

CREATE TABLE IF NOT EXISTS ratings (
    rating_id        SERIAL PRIMARY KEY,
    movie_id         INTEGER NOT NULL UNIQUE REFERENCES movies(movie_id) ON DELETE CASCADE,
    kinopoisk_rating DECIMAL(3,1)
);

CREATE TABLE IF NOT EXISTS favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id    INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
    watch_history_id SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id         INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    watched_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_time    INTEGER DEFAULT 0,
    completed        BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS movie_words (
    word_id       SERIAL PRIMARY KEY,
    movie_id      INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    word_original VARCHAR(255) NOT NULL,
    translation   VARCHAR(255) NOT NULL,
    context       TEXT,
    subtitle_time INTEGER,
    UNIQUE(movie_id, word_original)
);

CREATE TABLE IF NOT EXISTS user_dictionary (
    user_word_id SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    word_id      INTEGER NOT NULL REFERENCES movie_words(word_id) ON DELETE CASCADE,
    added_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id)
);

-- =============================================
-- ИНДЕКСЫ
-- =============================================

CREATE INDEX idx_movies_title_orig ON movies(title_orig);
CREATE INDEX idx_movies_title_ru ON movies(title_ru);
CREATE INDEX idx_movies_year ON movies(year);
CREATE INDEX idx_movies_country ON movies(country);
CREATE INDEX idx_subtitles_movie ON subtitles(movie_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_genre_movies_movie ON movie_genres(movie_id);


-- ==========================================
-- ЗАПОЛНЕНИЕ БД ТЕСТОВЫМИ ДАННЫМИ
-- ==========================================

-- 1. ФИЛЬМЫ
INSERT INTO movies (title_orig, title_ru, describe_ru, describe_eng, poster_path, year, country, duration) VALUES
(
    'Inception',
    'Начало',
    'Кобб — талантливый вор, лучший из лучших в опасном искусстве извлечения: он крадёт ценные секреты из глубин подсознания во время сна, когда человеческий разум наиболее уязвим.',
    'Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable.',
    '/cinema-storage/posters/inception.jpg',
    2010,
    'USA',
    148
),
(
    'Interstellar',
    'Интерстеллар',
    'Когда засуха, пыльные бури и вымирание растений приводят человечество к продовольственному кризису, группа исследователей и учёных отправляется сквозь червоточину в космосе в поисках нового дома для человечества.',
    'When drought, dust storms and plant extinction lead humanity to a food crisis, a group of explorers and scientists travel through a wormhole in space in search of a new home for humanity.',
    '/cinema-storage/posters/interstellar.jpg',
    2014,
    'USA',
    169
),
(
    'The Matrix',
    'Матрица',
    'Хакер Нео узнаёт, что его мир — виртуальная реальность, созданная машинами для контроля над людьми. Вместе с группой повстанцев он начинает борьбу за освобождение человечества.',
    'Hacker Neo discovers that his world is a virtual reality created by machines to control humans. Together with a group of rebels, he begins the fight to free humanity.',
    '/cinema-storage/posters/matrix.jpg',
    1999,
    'USA',
    136
);

-- 2. ЖАНРЫ
INSERT INTO genres (name) VALUES
('Sci-Fi'),
('Action'),
('Thriller'),
('Drama'),
('Adventure');

-- 3. ЖАНРЫ ФИЛЬМОВ
-- Inception (movie_id = 1): Sci-Fi, Action, Thriller
INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1, 1),  -- Inception + Sci-Fi
(1, 2),  -- Inception + Action
(1, 3),  -- Inception + Thriller

-- Interstellar (movie_id = 2): Sci-Fi, Drama, Adventure
(2, 1),  -- Interstellar + Sci-Fi
(2, 4),  -- Interstellar + Drama
(2, 5),  -- Interstellar + Adventure

-- The Matrix (movie_id = 3): Sci-Fi, Action
(3, 1),  -- Matrix + Sci-Fi
(3, 2);  -- Matrix + Action

-- 4. ВИДЕОФАЙЛЫ
INSERT INTO video_files (movie_id, quality, video_path, format) VALUES
(1, '360p', '/cinema-storage/movies/inception_360p.mp4', 'mp4'),
(2, '360p', '/cinema-storage/movies/interstellar_360p.mp4', 'mp4'),
(3, '360p', '/cinema-storage/movies/matrix_360p.mp4', 'mp4');

-- 5. СУБТИТРЫ
INSERT INTO subtitles (movie_id, language_code, subtitle_path, format) VALUES
-- Inception
(1, 'en', '/cinema-storage/subtitles/inception_en.vtt', 'vtt'),
(1, 'ru', '/cinema-storage/subtitles/inception_ru.vtt', 'vtt'),
-- Interstellar
(2, 'en', '/cinema-storage/subtitles/interstellar_en.vtt', 'vtt'),
(2, 'ru', '/cinema-storage/subtitles/interstellar_ru.vtt', 'vtt'),
-- The Matrix
(3, 'en', '/cinema-storage/subtitles/matrix_en.vtt', 'vtt'),
(3, 'ru', '/cinema-storage/subtitles/matrix_ru.vtt', 'vtt');

-- 6. РЕЙТИНГИ
INSERT INTO ratings (movie_id, kinopoisk_rating) VALUES
(1, 8.7),  -- Inception
(2, 8.6),  -- Interstellar
(3, 8.5);  -- The Matrix

-- 7. СЛОВАРЬ ВИДЕО (movie_words)

-- === Inception (movie_id = 1) ===
INSERT INTO movie_words (movie_id, word_original, translation, context, subtitle_time) VALUES
(1, 'dream',        'сон, мечта',           'You mustn''t be afraid to dream a little bigger.',                    1200),
(1, 'subconscious', 'подсознание',          'I need to get down into his subconscious.',                          450),
(1, 'extraction',   'извлечение',           'Extraction is the art of stealing secrets from the mind.',           120),
(1, 'architect',    'архитектор',           'You were the best architect I ever worked with.',                     2400),
(1, 'inception',    'внедрение',            'What is the most resilient parasite? An idea. Inception.',            3600),
(1, 'limbo',        'лимбо, забвение',      'You''re in limbo. Unconstructed dream space.',                       6000),
(1, 'totem',        'тотем',                'A totem. It''s a small personal object.',                             900),
(1, 'kick',         'толчок, пробуждение',  'We need a kick to wake up from the dream.',                          4200),
(1, 'forgery',      'подделка',             'He''s the best forger I''ve ever seen.',                              1800),
(1, 'paradox',      'парадокс',             'It''s like a Penrose staircase — an impossible paradox.',             2700),
(1, 'resilient',    'стойкий, живучий',     'What is the most resilient parasite?',                                3500),
(1, 'sedation',     'седация, усыпление',   'The sedation has to be heavy enough for three levels.',              4800),
(1, 'projection',   'проекция',             'His subconscious projections are hunting us.',                        1500),
(1, 'maze',         'лабиринт',            'Design me a maze that takes one minute to solve.',                    2100),
(1, 'gravity',      'гравитация',           'There''s no gravity in this dream level.',                            5400),

-- === Interstellar (movie_id = 2) ===
(2, 'wormhole',     'червоточина',          'We''ve found a wormhole near Saturn.',                                600),
(2, 'gravity',      'гравитация, тяжесть',  'Gravity can cross dimensions.',                                      3000),
(2, 'dimension',    'измерение',            'We are in the fifth dimension now.',                                  7200),
(2, 'survival',     'выживание',            'This is not about my survival. This is about the survival of us.',   1200),
(2, 'blight',       'фитофтороз, упадок',  'The blight is destroying all the crops.',                             300),
(2, 'endurance',    'выносливость',         'The Endurance is our ship.',                                          900),
(2, 'relativity',   'относительность',      'Time is relative out here.',                                         4800),
(2, 'tesseract',    'тессеракт',            'They constructed a tesseract inside the black hole.',                 7800),
(2, 'anomaly',      'аномалия',             'There''s a gravitational anomaly in the bookshelf.',                  1800),
(2, 'horizon',      'горизонт',             'We are close to the event horizon.',                                  6600),
(2, 'equation',     'уравнение',            'Professor Brand has been working on this equation for years.',        2400),
(2, 'orbit',        'орбита',               'We need to enter orbit around Miller''s planet.',                     3600),
(2, 'docking',      'стыковка',             'It''s not possible. No, it''s necessary. Initiating docking.',        7000),
(2, 'dust',         'пыль',                 'The dust storms are getting worse.',                                   150),
(2, 'mankind',      'человечество',         'Mankind was born on Earth. It was never meant to die here.',          5400),

-- === The Matrix (movie_id = 3) ===
(3, 'matrix',       'матрица',              'The Matrix is everywhere. It is all around us.',                       300),
(3, 'simulation',   'симуляция',            'Your entire life has been a simulation.',                              600),
(3, 'reality',      'реальность',           'What is real? How do you define real?',                                900),
(3, 'resistance',   'сопротивление',        'We are the resistance against the machines.',                          1500),
(3, 'prophecy',     'пророчество',          'The Oracle told me about the prophecy.',                               2400),
(3, 'construct',    'конструкт',            'This is the Construct. It''s our loading program.',                    1200),
(3, 'sentinel',     'страж',                'Sentinels are searching for our ship.',                                4200),
(3, 'agent',        'агент',                'Agents are programs within the Matrix.',                               1800),
(3, 'pill',         'таблетка',             'You take the red pill, you stay in Wonderland.',                       720),
(3, 'martial',      'боевой',               'I know martial arts. Show me.',                                        3000),
(3, 'dodge',        'уклоняться',           'Are you saying I can dodge bullets?',                                  5400),
(3, 'freedom',      'свобода',              'I didn''t say it would be easy. I said it would be worth the freedom.',3600),
(3, 'chosen',       'избранный',            'He is the Chosen One.',                                                4800),
(3, 'unplug',       'отключить',            'We have to unplug him before it''s too late.',                         2100),
(3, 'spoon',        'ложка',                'There is no spoon. It is not the spoon that bends, it is yourself.',  3300);

-- Добавляем колонку role с DEFAULT 'user'
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Добавляем колонку created_at в таблицу movies
ALTER TABLE movies ADD COLUMN created_at DATE;

UPDATE movies SET created_at = '2026-02-24';

ALTER TABLE movies
ALTER COLUMN created_at SET NOT NULL;

-- ==========================================
-- ДОБАВЛЕНИЕ АДМИНИСТРАТОРА
-- ==========================================
INSERT INTO users (login, password_hash, role)
VALUES ('admin', '$2a$10$VE9xyzPfH/REB8bNkiJFR.iScv9RQErpuIiDXp.PcUAfY2t7OHl0.', 'admin')
ON CONFLICT (login) DO NOTHING;