-- Supabase/Postgres Schema for MediAssist Pro (HealthSync AI)
-- Provides: users, patients, symptoms, chat_messages, providers, cases
-- All tables use uuid primary keys
-- Timestamps use 'timestamp with time zone' and default to now()
-- Foreign keys enforce referential integrity

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email varchar(255) NOT NULL UNIQUE,
    role varchar(32) NOT NULL CHECK (role IN ('patient', 'provider', 'admin')),
    name varchar(255) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- PATIENTS TABLE
CREATE TABLE patients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth date NOT NULL,
    gender varchar(32) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    phone varchar(32),
    insurance_provider varchar(255),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT fk_patient_user UNIQUE (user_id) -- 1-to-1 between user and patient
);

-- PROVIDERS TABLE
CREATE TABLE providers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization varchar(255),
    license_number varchar(64) NOT NULL UNIQUE,
    contact_info varchar(255),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT fk_provider_user UNIQUE (user_id) -- 1-to-1 between user and provider
);

-- SYMPTOMS TABLE
CREATE TABLE symptoms (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    symptom_input text NOT NULL,
    triage_result text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- CHAT_MESSAGES TABLE
CREATE TABLE chat_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    sender_type varchar(16) NOT NULL CHECK (sender_type IN ('patient', 'provider', 'ai')),
    message text NOT NULL,
    timestamp timestamp with time zone NOT NULL DEFAULT now()
);

-- CASES TABLE
CREATE TABLE cases (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    symptom_summary text NOT NULL,
    status varchar(32) NOT NULL CHECK (status IN ('open', 'in_progress', 'closed', 'archived')),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for faster lookups where appropriate
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_symptoms_patient_id ON symptoms(patient_id);
CREATE INDEX idx_chatmsg_patient_id ON chat_messages(patient_id);
CREATE INDEX idx_cases_patient_id ON cases(patient_id);
CREATE INDEX idx_cases_provider_id ON cases(provider_id);
