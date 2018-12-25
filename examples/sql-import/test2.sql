--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3 (Debian 10.3-1.pgdg90+1)
-- Dumped by pg_dump version 10.3 (Debian 10.3-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: concat(anynonarray, anynonarray); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.concat(anynonarray, anynonarray) RETURNS text
    LANGUAGE sql
    AS $_$SELECT CAST($1 AS text) || CAST($2 AS text);$_$;


ALTER FUNCTION public.concat(anynonarray, anynonarray) OWNER TO postgres;

--
-- Name: concat(anynonarray, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.concat(anynonarray, text) RETURNS text
    LANGUAGE sql
    AS $_$SELECT CAST($1 AS text) || $2;$_$;


ALTER FUNCTION public.concat(anynonarray, text) OWNER TO postgres;

--
-- Name: concat(text, anynonarray); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.concat(text, anynonarray) RETURNS text
    LANGUAGE sql
    AS $_$SELECT $1 || CAST($2 AS text);$_$;


ALTER FUNCTION public.concat(text, anynonarray) OWNER TO postgres;

--
-- Name: concat(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.concat(text, text) RETURNS text
    LANGUAGE sql
    AS $_$SELECT $1 || $2;$_$;


ALTER FUNCTION public.concat(text, text) OWNER TO postgres;

--
-- Name: greatest(numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."greatest"(numeric, numeric) RETURNS numeric
    LANGUAGE sql
    AS $_$SELECT CASE WHEN (($1 > $2) OR ($2 IS NULL)) THEN $1 ELSE $2 END;$_$;


ALTER FUNCTION public."greatest"(numeric, numeric) OWNER TO postgres;

--
-- Name: greatest(numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public."greatest"(numeric, numeric, numeric) RETURNS numeric
    LANGUAGE sql
    AS $_$SELECT greatest($1, greatest($2, $3));$_$;


ALTER FUNCTION public."greatest"(numeric, numeric, numeric) OWNER TO postgres;

--
-- Name: rand(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rand() RETURNS double precision
    LANGUAGE sql
    AS $$SELECT random();$$;


ALTER FUNCTION public.rand() OWNER TO postgres;

--
-- Name: substring_index(text, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.substring_index(text, text, integer) RETURNS text
    LANGUAGE sql
    AS $_$SELECT array_to_string((string_to_array($1, $2)) [1:$3], $2);$_$;


ALTER FUNCTION public.substring_index(text, text, integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    uid bigint DEFAULT 0 NOT NULL,
    name character varying(60) DEFAULT ''::character varying NOT NULL,
    pass character varying(128) DEFAULT ''::character varying NOT NULL,
    mail character varying(254) DEFAULT ''::character varying,
    theme character varying(255) DEFAULT ''::character varying NOT NULL,
    signature character varying(255) DEFAULT ''::character varying NOT NULL,
    signature_format character varying(255),
    created integer DEFAULT 0 NOT NULL,
    access integer DEFAULT 0 NOT NULL,
    login integer DEFAULT 0 NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    timezone character varying(32),
    language character varying(12) DEFAULT ''::character varying NOT NULL,
    picture integer DEFAULT 0 NOT NULL,
    init character varying(254) DEFAULT ''::character varying,
    data bytea,
    CONSTRAINT users_uid_check CHECK ((uid >= 0))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Stores user data.';


--
-- Name: COLUMN users.uid; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.uid IS 'Primary Key: Unique user ID.';


--
-- Name: COLUMN users.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.name IS 'Unique user name.';


--
-- Name: COLUMN users.pass; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.pass IS 'User''s password (hashed).';


--
-- Name: COLUMN users.mail; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.mail IS 'User''s e-mail address.';


--
-- Name: COLUMN users.theme; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.theme IS 'User''s default theme.';


--
-- Name: COLUMN users.signature; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.signature IS 'User''s signature.';


--
-- Name: COLUMN users.signature_format; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.signature_format IS 'The filter_format.format of the signature.';


--
-- Name: COLUMN users.created; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.created IS 'Timestamp for when user was created.';


--
-- Name: COLUMN users.access; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.access IS 'Timestamp for previous time user accessed the site.';


--
-- Name: COLUMN users.login; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.login IS 'Timestamp for user''s last login.';


--
-- Name: COLUMN users.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.status IS 'Whether the user is active(1) or blocked(0).';


--
-- Name: COLUMN users.timezone; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.timezone IS 'User''s time zone.';


--
-- Name: COLUMN users.language; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.language IS 'User''s default language.';


--
-- Name: COLUMN users.picture; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.picture IS 'Foreign key: file_managed.fid of user''s picture.';


--
-- Name: COLUMN users.init; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.init IS 'E-mail address used for initial account creation.';


--
-- Name: COLUMN users.data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.data IS 'A serialized array of name value pairs that are related to the user. Any form values posted during user edit are stored and are loaded into the $user object during user_load(). Use of this field is discouraged and it will likely disappear in a future version of Drupal.';

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (uid, name, pass, mail, theme, signature, signature_format, created, access, login, status, timezone, language, picture, init, data) FROM stdin;
0						\N	0	0	0	0	\N		0		\N
1	root	$S$DFgk2BgaCLgYz0ve19gwe6vAi5VLTfx4veAAr14mW/vCCtOuTi.0	picard@starfleet.mil			\N	1526471935	1526471972	1526471972	1	America/New_York		0	picard@starfleet.mil	\\x623a303b
\.

--
-- Name: users users_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_name_key UNIQUE (name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- PostgreSQL database dump complete
--
