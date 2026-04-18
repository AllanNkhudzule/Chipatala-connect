CREATE DATABASE unmaid;

\c unmaid;

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_type VARCHAR(10),
  allergies TEXT,
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE,
  password_hash TEXT NOT NULL,
  photo_url TEXT,
  institution VARCHAR(100) DEFAULT 'University of Malawi',
  insurance_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  facility_name VARCHAR(200),
  visit_date DATE DEFAULT CURRENT_DATE,
  diagnosis TEXT,
  medications TEXT,
  hiv_status VARCHAR(50),
  tb_status VARCHAR(50),
  other_conditions TEXT,
  notes TEXT,
  doctor_name VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(100),
  accepts_unmaid BOOLEAN DEFAULT TRUE,
  email VARCHAR(100) UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  token VARCHAR(20) UNIQUE NOT NULL,
  scope VARCHAR(50) DEFAULT 'full',
  include_identity BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
