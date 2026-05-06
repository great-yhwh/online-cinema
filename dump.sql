--
-- PostgreSQL database dump
--

\restrict G4FMuA5K9IpaizEjgimaIrorBeSnOYVfuAtfwIUdVCPhw59IyHDeSV3vgOhwvYj

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.favorites (
    favorite_id integer NOT NULL,
    user_id integer NOT NULL,
    movie_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.favorites OWNER TO cinema_user;

--
-- Name: favorites_favorite_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.favorites_favorite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_favorite_id_seq OWNER TO cinema_user;

--
-- Name: favorites_favorite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.favorites_favorite_id_seq OWNED BY public.favorites.favorite_id;


--
-- Name: genres; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.genres (
    genre_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.genres OWNER TO cinema_user;

--
-- Name: genres_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.genres_genre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genres_genre_id_seq OWNER TO cinema_user;

--
-- Name: genres_genre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.genres_genre_id_seq OWNED BY public.genres.genre_id;


--
-- Name: movie_genres; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.movie_genres (
    movie_genre_id integer NOT NULL,
    movie_id integer NOT NULL,
    genre_id integer NOT NULL
);


ALTER TABLE public.movie_genres OWNER TO cinema_user;

--
-- Name: movie_genres_movie_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.movie_genres_movie_genre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movie_genres_movie_genre_id_seq OWNER TO cinema_user;

--
-- Name: movie_genres_movie_genre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.movie_genres_movie_genre_id_seq OWNED BY public.movie_genres.movie_genre_id;


--
-- Name: movie_words; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.movie_words (
    word_id integer NOT NULL,
    movie_id integer NOT NULL,
    word_original character varying(255) NOT NULL,
    translation character varying(255) NOT NULL,
    context text,
    subtitle_time integer
);


ALTER TABLE public.movie_words OWNER TO cinema_user;

--
-- Name: movie_words_word_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.movie_words_word_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movie_words_word_id_seq OWNER TO cinema_user;

--
-- Name: movie_words_word_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.movie_words_word_id_seq OWNED BY public.movie_words.word_id;


--
-- Name: movies; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.movies (
    movie_id integer NOT NULL,
    title_orig character varying(255) NOT NULL,
    title_ru character varying(255),
    describe_ru text,
    describe_eng text,
    poster_path character varying(500),
    year smallint,
    country character varying(100),
    duration smallint,
    created_at date NOT NULL
);


ALTER TABLE public.movies OWNER TO cinema_user;

--
-- Name: movies_movie_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.movies_movie_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movies_movie_id_seq OWNER TO cinema_user;

--
-- Name: movies_movie_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.movies_movie_id_seq OWNED BY public.movies.movie_id;


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.ratings (
    rating_id integer NOT NULL,
    movie_id integer NOT NULL,
    kinopoisk_rating numeric(3,1)
);


ALTER TABLE public.ratings OWNER TO cinema_user;

--
-- Name: ratings_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.ratings_rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ratings_rating_id_seq OWNER TO cinema_user;

--
-- Name: ratings_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.ratings_rating_id_seq OWNED BY public.ratings.rating_id;


--
-- Name: subtitles; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.subtitles (
    subtitle_id integer NOT NULL,
    movie_id integer NOT NULL,
    language_code character varying(10) NOT NULL,
    subtitle_path character varying(500) NOT NULL,
    format character varying(20)
);


ALTER TABLE public.subtitles OWNER TO cinema_user;

--
-- Name: subtitles_subtitle_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.subtitles_subtitle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subtitles_subtitle_id_seq OWNER TO cinema_user;

--
-- Name: subtitles_subtitle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.subtitles_subtitle_id_seq OWNED BY public.subtitles.subtitle_id;


--
-- Name: user_dictionary; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.user_dictionary (
    user_word_id integer NOT NULL,
    user_id integer NOT NULL,
    word_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_dictionary OWNER TO cinema_user;

--
-- Name: user_dictionary_user_word_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.user_dictionary_user_word_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_dictionary_user_word_id_seq OWNER TO cinema_user;

--
-- Name: user_dictionary_user_word_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.user_dictionary_user_word_id_seq OWNED BY public.user_dictionary.user_word_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    login character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(20) DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO cinema_user;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO cinema_user;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: video_files; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.video_files (
    video_file_id integer NOT NULL,
    movie_id integer NOT NULL,
    quality character varying(20),
    video_path character varying(500) NOT NULL,
    format character varying(20)
);


ALTER TABLE public.video_files OWNER TO cinema_user;

--
-- Name: video_files_video_file_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.video_files_video_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.video_files_video_file_id_seq OWNER TO cinema_user;

--
-- Name: video_files_video_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.video_files_video_file_id_seq OWNED BY public.video_files.video_file_id;


--
-- Name: watch_history; Type: TABLE; Schema: public; Owner: cinema_user
--

CREATE TABLE public.watch_history (
    watch_history_id integer NOT NULL,
    user_id integer NOT NULL,
    movie_id integer NOT NULL,
    watched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    progress_time integer DEFAULT 0,
    completed boolean DEFAULT false
);


ALTER TABLE public.watch_history OWNER TO cinema_user;

--
-- Name: watch_history_watch_history_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_user
--

CREATE SEQUENCE public.watch_history_watch_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.watch_history_watch_history_id_seq OWNER TO cinema_user;

--
-- Name: watch_history_watch_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_user
--

ALTER SEQUENCE public.watch_history_watch_history_id_seq OWNED BY public.watch_history.watch_history_id;


--
-- Name: favorites favorite_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.favorites ALTER COLUMN favorite_id SET DEFAULT nextval('public.favorites_favorite_id_seq'::regclass);


--
-- Name: genres genre_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.genres ALTER COLUMN genre_id SET DEFAULT nextval('public.genres_genre_id_seq'::regclass);


--
-- Name: movie_genres movie_genre_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_genres ALTER COLUMN movie_genre_id SET DEFAULT nextval('public.movie_genres_movie_genre_id_seq'::regclass);


--
-- Name: movie_words word_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_words ALTER COLUMN word_id SET DEFAULT nextval('public.movie_words_word_id_seq'::regclass);


--
-- Name: movies movie_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movies ALTER COLUMN movie_id SET DEFAULT nextval('public.movies_movie_id_seq'::regclass);


--
-- Name: ratings rating_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.ratings ALTER COLUMN rating_id SET DEFAULT nextval('public.ratings_rating_id_seq'::regclass);


--
-- Name: subtitles subtitle_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.subtitles ALTER COLUMN subtitle_id SET DEFAULT nextval('public.subtitles_subtitle_id_seq'::regclass);


--
-- Name: user_dictionary user_word_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.user_dictionary ALTER COLUMN user_word_id SET DEFAULT nextval('public.user_dictionary_user_word_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: video_files video_file_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.video_files ALTER COLUMN video_file_id SET DEFAULT nextval('public.video_files_video_file_id_seq'::regclass);


--
-- Name: watch_history watch_history_id; Type: DEFAULT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.watch_history ALTER COLUMN watch_history_id SET DEFAULT nextval('public.watch_history_watch_history_id_seq'::regclass);


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.favorites (favorite_id, user_id, movie_id, added_at) FROM stdin;
1	1	1	2026-04-26 23:32:26.860989
\.


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.genres (genre_id, name) FROM stdin;
1	Sci-Fi
2	Action
3	Thriller
4	Drama
5	Adventure
\.


--
-- Data for Name: movie_genres; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.movie_genres (movie_genre_id, movie_id, genre_id) FROM stdin;
1	1	1
2	1	2
3	1	3
4	2	1
5	2	4
6	2	5
7	3	1
8	3	2
\.


--
-- Data for Name: movie_words; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.movie_words (word_id, movie_id, word_original, translation, context, subtitle_time) FROM stdin;
1	1	dream	сон, мечта	You mustn't be afraid to dream a little bigger.	1200
2	1	subconscious	подсознание	I need to get down into his subconscious.	450
3	1	extraction	извлечение	Extraction is the art of stealing secrets from the mind.	120
4	1	architect	архитектор	You were the best architect I ever worked with.	2400
5	1	inception	внедрение	What is the most resilient parasite? An idea. Inception.	3600
6	1	limbo	лимбо, забвение	You're in limbo. Unconstructed dream space.	6000
7	1	totem	тотем	A totem. It's a small personal object.	900
8	1	kick	толчок, пробуждение	We need a kick to wake up from the dream.	4200
9	1	forgery	подделка	He's the best forger I've ever seen.	1800
10	1	paradox	парадокс	It's like a Penrose staircase — an impossible paradox.	2700
11	1	resilient	стойкий, живучий	What is the most resilient parasite?	3500
12	1	sedation	седация, усыпление	The sedation has to be heavy enough for three levels.	4800
13	1	projection	проекция	His subconscious projections are hunting us.	1500
14	1	maze	лабиринт	Design me a maze that takes one minute to solve.	2100
15	1	gravity	гравитация	There's no gravity in this dream level.	5400
16	2	wormhole	червоточина	We've found a wormhole near Saturn.	600
17	2	gravity	гравитация, тяжесть	Gravity can cross dimensions.	3000
18	2	dimension	измерение	We are in the fifth dimension now.	7200
19	2	survival	выживание	This is not about my survival. This is about the survival of us.	1200
20	2	blight	фитофтороз, упадок	The blight is destroying all the crops.	300
21	2	endurance	выносливость	The Endurance is our ship.	900
22	2	relativity	относительность	Time is relative out here.	4800
23	2	tesseract	тессеракт	They constructed a tesseract inside the black hole.	7800
24	2	anomaly	аномалия	There's a gravitational anomaly in the bookshelf.	1800
25	2	horizon	горизонт	We are close to the event horizon.	6600
26	2	equation	уравнение	Professor Brand has been working on this equation for years.	2400
27	2	orbit	орбита	We need to enter orbit around Miller's planet.	3600
28	2	docking	стыковка	It's not possible. No, it's necessary. Initiating docking.	7000
29	2	dust	пыль	The dust storms are getting worse.	150
30	2	mankind	человечество	Mankind was born on Earth. It was never meant to die here.	5400
31	3	matrix	матрица	The Matrix is everywhere. It is all around us.	300
32	3	simulation	симуляция	Your entire life has been a simulation.	600
33	3	reality	реальность	What is real? How do you define real?	900
34	3	resistance	сопротивление	We are the resistance against the machines.	1500
35	3	prophecy	пророчество	The Oracle told me about the prophecy.	2400
36	3	construct	конструкт	This is the Construct. It's our loading program.	1200
37	3	sentinel	страж	Sentinels are searching for our ship.	4200
38	3	agent	агент	Agents are programs within the Matrix.	1800
39	3	pill	таблетка	You take the red pill, you stay in Wonderland.	720
40	3	martial	боевой	I know martial arts. Show me.	3000
41	3	dodge	уклоняться	Are you saying I can dodge bullets?	5400
42	3	freedom	свобода	I didn't say it would be easy. I said it would be worth the freedom.	3600
43	3	chosen	избранный	He is the Chosen One.	4800
44	3	unplug	отключить	We have to unplug him before it's too late.	2100
45	3	spoon	ложка	There is no spoon. It is not the spoon that bends, it is yourself.	3300
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.movies (movie_id, title_orig, title_ru, describe_ru, describe_eng, poster_path, year, country, duration, created_at) FROM stdin;
1	Inception	Начало	Кобб — талантливый вор, лучший из лучших в опасном искусстве извлечения: он крадёт ценные секреты из глубин подсознания во время сна, когда человеческий разум наиболее уязвим.	Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable.	/cinema-storage/posters/inception.jpg	2010	USA	148	2026-02-24
2	Interstellar	Интерстеллар	Когда засуха, пыльные бури и вымирание растений приводят человечество к продовольственному кризису, группа исследователей и учёных отправляется сквозь червоточину в космосе в поисках нового дома для человечества.	When drought, dust storms and plant extinction lead humanity to a food crisis, a group of explorers and scientists travel through a wormhole in space in search of a new home for humanity.	/cinema-storage/posters/interstellar.jpg	2014	USA	169	2026-02-24
3	The Matrix	Матрица	Хакер Нео узнаёт, что его мир — виртуальная реальность, созданная машинами для контроля над людьми. Вместе с группой повстанцев он начинает борьбу за освобождение человечества.	Hacker Neo discovers that his world is a virtual reality created by machines to control humans. Together with a group of rebels, he begins the fight to free humanity.	/cinema-storage/posters/matrix.jpg	1999	USA	136	2026-02-24
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.ratings (rating_id, movie_id, kinopoisk_rating) FROM stdin;
1	1	8.7
2	2	8.6
3	3	8.5
\.


--
-- Data for Name: subtitles; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.subtitles (subtitle_id, movie_id, language_code, subtitle_path, format) FROM stdin;
1	1	en	/cinema-storage/subtitles/inception_en.vtt	vtt
2	1	ru	/cinema-storage/subtitles/inception_ru.vtt	vtt
3	2	en	/cinema-storage/subtitles/interstellar_en.vtt	vtt
4	2	ru	/cinema-storage/subtitles/interstellar_ru.vtt	vtt
5	3	en	/cinema-storage/subtitles/matrix_en.vtt	vtt
6	3	ru	/cinema-storage/subtitles/matrix_ru.vtt	vtt
\.


--
-- Data for Name: user_dictionary; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.user_dictionary (user_word_id, user_id, word_id, added_at) FROM stdin;
1	1	2	2026-04-26 23:32:24.654578
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.users (user_id, login, password_hash, created_at, role) FROM stdin;
1	admin	$2a$10$VE9xyzPfH/REB8bNkiJFR.iScv9RQErpuIiDXp.PcUAfY2t7OHl0.	2026-04-26 23:25:10.04629	admin
\.


--
-- Data for Name: video_files; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.video_files (video_file_id, movie_id, quality, video_path, format) FROM stdin;
1	1	360p	/cinema-storage/movies/inception_360p.mp4	mp4
2	2	360p	/cinema-storage/movies/interstellar_360p.mp4	mp4
3	3	360p	/cinema-storage/movies/matrix_360p.mp4	mp4
\.


--
-- Data for Name: watch_history; Type: TABLE DATA; Schema: public; Owner: cinema_user
--

COPY public.watch_history (watch_history_id, user_id, movie_id, watched_at, progress_time, completed) FROM stdin;
\.


--
-- Name: favorites_favorite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.favorites_favorite_id_seq', 1, true);


--
-- Name: genres_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.genres_genre_id_seq', 5, true);


--
-- Name: movie_genres_movie_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.movie_genres_movie_genre_id_seq', 8, true);


--
-- Name: movie_words_word_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.movie_words_word_id_seq', 45, true);


--
-- Name: movies_movie_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.movies_movie_id_seq', 3, true);


--
-- Name: ratings_rating_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.ratings_rating_id_seq', 3, true);


--
-- Name: subtitles_subtitle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.subtitles_subtitle_id_seq', 6, true);


--
-- Name: user_dictionary_user_word_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.user_dictionary_user_word_id_seq', 1, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


--
-- Name: video_files_video_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.video_files_video_file_id_seq', 3, true);


--
-- Name: watch_history_watch_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_user
--

SELECT pg_catalog.setval('public.watch_history_watch_history_id_seq', 1, false);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (favorite_id);


--
-- Name: favorites favorites_user_id_movie_id_key; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_movie_id_key UNIQUE (user_id, movie_id);


--
-- Name: genres genres_name_key; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_name_key UNIQUE (name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (genre_id);


--
-- Name: movie_genres movie_genres_movie_id_genre_id_key; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_movie_id_genre_id_key UNIQUE (movie_id, genre_id);


--
-- Name: movie_genres movie_genres_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_pkey PRIMARY KEY (movie_genre_id);


--
-- Name: movie_words movie_words_movie_id_word_original_key; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_words
    ADD CONSTRAINT movie_words_movie_id_word_original_key UNIQUE (movie_id, word_original);


--
-- Name: movie_words movie_words_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_words
    ADD CONSTRAINT movie_words_pkey PRIMARY KEY (word_id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (movie_id);


--
-- Name: ratings ratings_movie_id_key; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_movie_id_key UNIQUE (movie_id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (rating_id);


--
-- Name: subtitles subtitles_movie_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.subtitles
    ADD CONSTRAINT subtitles_movie_id_language_code_key UNIQUE (movie_id, language_code);


--
-- Name: subtitles subtitles_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.subtitles
    ADD CONSTRAINT subtitles_pkey PRIMARY KEY (subtitle_id);


--
-- Name: user_dictionary user_dictionary_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.user_dictionary
    ADD CONSTRAINT user_dictionary_pkey PRIMARY KEY (user_word_id);


--
-- Name: user_dictionary user_dictionary_user_id_word_id_key; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.user_dictionary
    ADD CONSTRAINT user_dictionary_user_id_word_id_key UNIQUE (user_id, word_id);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: video_files video_files_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.video_files
    ADD CONSTRAINT video_files_pkey PRIMARY KEY (video_file_id);


--
-- Name: watch_history watch_history_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT watch_history_pkey PRIMARY KEY (watch_history_id);


--
-- Name: idx_favorites_user; Type: INDEX; Schema: public; Owner: cinema_user
--

CREATE INDEX idx_favorites_user ON public.favorites USING btree (user_id);


--
-- Name: idx_genre_movies_movie; Type: INDEX; Schema: public; Owner: cinema_user
--

CREATE INDEX idx_genre_movies_movie ON public.movie_genres USING btree (movie_id);


--
-- Name: idx_movies_country; Type: INDEX; Schema: public; Owner: cinema_user
--

CREATE INDEX idx_movies_country ON public.movies USING btree (country);


--
-- Name: idx_movies_title_orig; Type: INDEX; Schema: public; Owner: cinema_user
--

CREATE INDEX idx_movies_title_orig ON public.movies USING btree (title_orig);


--
-- Name: idx_movies_title_ru; Type: INDEX; Schema: public; Owner: cinema_user
--

CREATE INDEX idx_movies_title_ru ON public.movies USING btree (title_ru);


--
-- Name: idx_movies_year; Type: INDEX; Schema: public; Owner: cinema_user
--

CREATE INDEX idx_movies_year ON public.movies USING btree (year);


--
-- Name: idx_subtitles_movie; Type: INDEX; Schema: public; Owner: cinema_user
--

CREATE INDEX idx_subtitles_movie ON public.subtitles USING btree (movie_id);


--
-- Name: idx_watch_history_user; Type: INDEX; Schema: public; Owner: cinema_user
--

CREATE INDEX idx_watch_history_user ON public.watch_history USING btree (user_id);


--
-- Name: favorites favorites_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(movie_id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: movie_genres movie_genres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(genre_id) ON DELETE CASCADE;


--
-- Name: movie_genres movie_genres_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(movie_id) ON DELETE CASCADE;


--
-- Name: movie_words movie_words_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.movie_words
    ADD CONSTRAINT movie_words_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(movie_id) ON DELETE CASCADE;


--
-- Name: ratings ratings_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(movie_id) ON DELETE CASCADE;


--
-- Name: subtitles subtitles_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.subtitles
    ADD CONSTRAINT subtitles_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(movie_id) ON DELETE CASCADE;


--
-- Name: user_dictionary user_dictionary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.user_dictionary
    ADD CONSTRAINT user_dictionary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_dictionary user_dictionary_word_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.user_dictionary
    ADD CONSTRAINT user_dictionary_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.movie_words(word_id) ON DELETE CASCADE;


--
-- Name: video_files video_files_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.video_files
    ADD CONSTRAINT video_files_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(movie_id) ON DELETE CASCADE;


--
-- Name: watch_history watch_history_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT watch_history_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(movie_id) ON DELETE CASCADE;


--
-- Name: watch_history watch_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_user
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT watch_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict G4FMuA5K9IpaizEjgimaIrorBeSnOYVfuAtfwIUdVCPhw59IyHDeSV3vgOhwvYj

