# 🌍 Earth Semantic — Architecture

## 📌 Overview

**Earth Semantic** is a multimodal geospatial intelligence system that enables:

* 🔎 **Natural language search** over satellite imagery
* 🛰️ **Semantic discovery** of locations
* ⏳ **Multi-temporal change detection**
* 🛡️️ **False-alarm suppression**
* 👤 **Analyst-driven validation** with a full audit trail

> **Core Design Philosophy:** The system is designed as a **100% offline, local-first architecture** with zero dependency on cloud GPUs, external storage, or managed cloud databases.

---

## 🏗️ High-Level Architecture

```text
[ Satellite Data ] ──► [ Preprocessing ] ──► [ Embeddings ] ──► [ Geo-Vector Index ]
                                                                         │
                                         ┌───────────────────────────────┴───────────────────────────────┐
                                         ▼                                                               ▼
                              [ Semantic Retrieval ]                                            [ Change Analysis ]
                                         │                                                               │
                                         └───────────────────────────────┬───────────────────────────────┘
                                                                         ▼
                                                            [ False Alarm Suppression ]
                                                                         │
                                                                         ▼
                                                              [ Change Confidence ]
                                                                         │
                                                                         ▼
                                                                [ Analyst Review ]
                                                                         │
                                                                         ▼
                                                             [ Provenance & Feedback ]
                                                                         ↺ (Continuous Learning Loop)
```

---

## 🧩 Core System Modules

### 🛰️ 1. Satellite Data Ingestion

* **Inputs:**
  * Optical imagery (`RGB`, `NIR`, `SWIR`)
  * SAR (Synthetic Aperture Radar — day/night & all-weather capability)
  * Multi-temporal data sequences ($T_1 \rightarrow T_n$)
  * Metadata (date, sensor type, geographic coordinates, spatial resolution)
* **Purpose:** To provide standardized, multi-modal Earth observation data for downstream processing.

### 🧹 2. Preprocessing & Quality Control

* **Steps:**
  1. Geo-referencing
  2. Cloud & haze masking
  3. Radiometric normalization
  4. Multi-sensor co-registration
  5. Resolution harmonization
  6. Automated quality scoring
* **Output:** Clean, spatially aligned, and analysis-ready satellite tiles.

### 🧠 3. Multimodal Embedding Engine

| Modality | Output Representation |
| :--- | :--- |
| **Text** | Text Embeddings |
| **Image** | Image Embeddings |
| **Satellite** | Geospatial Embeddings |

* **Function:** Transforms all modalities into a unified, shared semantic representation space capturing:
  * Spatial features
  * Spectral signatures
  * Temporal patterns
  * High-level semantic meaning

### 🗂️ 4. Geo-Vector Index

| Index Component | Primary Function |
| :--- | :--- |
| **Vector Index** | High-dimensional embedding similarity search |
| **Spatial Index** | Geographic bounding-box & polygon filtering |
| **Metadata Index** | Filtering by timestamp, sensor type, and data quality |

* **Role:** Enables fast **hybrid search** combining:
  * Semantic similarity
  * Spatial constraints
  * Temporal filtering

### 🔍 5. Semantic Retrieval Pipeline

* **Flow:**
```text
[ Natural Language Query ]
            │
            ▼
  [ Query Understanding ]
            │
            ▼
 [ Embedding Generation ]
            │
            ▼
[ Vector Similarity Search ]
            │
            ▼
[ Spatial + Temporal Filtering ]
            │
            ▼
   [ Candidate Ranking ]
            │
            ▼
   [ Ranked Locations ]
```
* **Output:** Semantically relevant, geo-referenced locations matching user intent.

### ⏳ 6. Multi-Temporal Change Analysis

* **Flow:**
```text
[ T1 ──► T2 ──► T3 ──► Tn ]
            │
            ▼
  [ Temporal Alignment ]
            │
            ▼
  [ Feature Extraction ]
            │
            ▼
[ Image / Feature Comparison ]
            │
            ▼
[ Spatial Change Detection ]
            │
            ▼
[ Raw Change Candidates ]
```
* **Output:** Spatially localized candidate changes across time intervals.

### 🛡️ 7. False-Alarm Suppression

* **Suppression Filters:**
  * Seasonal vegetation/phenology shifts
  * Cloud cover & shadow artifacts
  * Off-nadir viewing angle variations
  * Cross-sensor calibration differences
  * Sub-pixel registration errors
  * Atmospheric & aerosol variations
* **Goal:** Drastically reduce false positives caused by environmental and sensor noise.

### 📈 8. Change Confidence Estimation

* **Evaluation Signals:**
  * Temporal consistency
  * Spatial coherence & consistency
  * Spectral / visual evidence strength
  * SAR cross-modality confirmation
  * Underlying tile data quality
  * Multi-sensor agreement
* **Output:** Calibrated confidence score for each detected change event.

### 👤 9. Analyst Review Interface

* **Features:**
  * Interactive Before / After visual comparison
  * Multi-modal evidence visualization
  * Confidence score breakdown
  * Full data provenance tracking
* **Analyst Actions:**
  * ✅ **Accept** (Confirm valid change/detection)
  * ❌ **Reject** (Mark as false positive)
  * 🚩 **Flag** (Escalate for secondary inspection)

### 📋 10. Provenance & Audit Trail

* **Tracked Metadata:**
  * Raw data source identifiers
  * Applied preprocessing steps
  * Exact AI/ML model versions
  * Supporting evidence used
  * Analyst decisions & annotations
  * Cryptographic/system timestamps
* **Feedback Loop Integration:** Analyst decisions are systematically fed back into:
  * Embedding model fine-tuning
  * Retrieval ranking calibration
  * Overall system threshold optimization

---

## 🔁 Continuous Feedback Loop

```text
[ Analyst Feedback ]
         │
         ▼
 [ System Learning ]
         │
         ▼
[ Embedding Improvement + Index Optimization ]
```

---

## ⚙️ Deployment Architecture

### Core Characteristics
* 🔒 **100% Offline-First:** Operates in air-gapped or disconnected environments.
* 💻 **Local Computation:** All inference and indexing run on local hardware.
* 🚫 **Zero Cloud Dependency:** No external API calls, cloud storage, or managed services required.

### High-Level Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React / Next.js |
| **Backend** | FastAPI |
| **AI / ML** | PyTorch |
| **Geospatial Processing** | GDAL, Rasterio |
| **Database & Indexing** | PostgreSQL + PostGIS + `pgvector` |
| **Object Storage** | Local Filesystem / MinIO |

---

## 🚀 Key Highlights

* 🌐 **Multimodal AI:** Unified representation across Text + Image + Multi-spectral/SAR Satellite data.
* 🛰️ **Semantic Earth Observation Search:** Query petabyte-scale concepts using natural language.
* ⏳ **Temporal Intelligence:** Automated multi-date change detection across time series ($T_1 \rightarrow T_n$).
* 🛡️ **Robust False-Alarm Filtering:** Multi-stage environmental and sensor noise suppression.
* 👤 **Human-in-the-Loop Validation:** Auditable analyst workflows that actively improve model accuracy.
* 🔒 **Fully Offline & Secure Architecture:** Purpose-built for high-security, sovereign, and field deployments.