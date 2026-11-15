/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Medically Accurate Anatomical Structures & Organ Database
 * Comprehensive telemetry, anatomical dimensions, internal components,
 * vascular dynamics, and physiological curve data for 3D exploration.
 */

export interface AnatomicalSubstructure {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'nominal' | 'elevated' | 'monitored';
  anatomicalCode: string;
}

export interface DimensionMetric {
  label: string;
  value: string;
  unit: string;
  baseline: string;
}

export interface PhysiologicalChartPoint {
  name: string;
  value: number;
  secondary?: number;
  baseline?: number;
  reference?: number;
}

export interface RelatedSystemConnection {
  targetSystem: string;
  relationType: string;
  pathway: string;
  functionalRole: string;
  direction: 'afferent' | 'efferent' | 'reciprocal';
}

export interface AnatomicalOrganData {
  id: string;
  name: string;
  latinName: string;
  system: string;
  location: string;
  color: string;
  position3D: [number, number, number];
  scale3D: [number, number, number];
  meshType: 'sphere' | 'cylinder' | 'box' | 'lobed' | 'bilateral' | 'vascular' | 'skeletal' | 'neural';
  characteristics: string[];
  dimensions: DimensionMetric[];
  structures: AnatomicalSubstructure[];
  bloodSupply: {
    arterial: string;
    venous: string;
    perfusionRate: string;
    vascularResistance: string;
  };
  telemetryMetrics: {
    label: string;
    value: string;
    status: 'nominal' | 'warning' | 'alert';
    normalRange: string;
    flightTolerance: string;
  }[];
  chartConfig: {
    title: string;
    yAxisLabel: string;
    xAxisLabel: string;
    primaryLegend: string;
    secondaryLegend?: string;
    data: PhysiologicalChartPoint[];
  };
  relatedSystems: RelatedSystemConnection[];
  crossSectionLabels: {
    id: string;
    name: string;
    x: number;
    y: number;
    details: string;
  }[];
}

export const ANATOMICAL_ORGANS_DATA: Record<string, AnatomicalOrganData> = {
  heart: {
    id: 'heart',
    name: 'Heart',
    latinName: 'Cor / Myocardium',
    system: 'Cardiovascular System',
    location: 'Middle Mediastinum (Pericardial Cavity, T5-T8 vertebrae)',
    color: '#ef4444',
    position3D: [-0.22, 2.85, 0.35],
    scale3D: [0.34, 0.42, 0.32],
    meshType: 'sphere',
    characteristics: [
      'Four-chambered muscular double-pump',
      'Intrinsic electrical conduction system (SA/AV nodes)',
      'Pericardial sac stabilization',
      'Stroke volume cephalic redistribution in 0-G',
    ],
    dimensions: [
      { label: 'Organ Mass', value: '310', unit: 'g', baseline: '280-340 g' },
      { label: 'Longitudinal Axis', value: '12.0', unit: 'cm', baseline: '11-13 cm' },
      { label: 'Transverse Diameter', value: '8.5', unit: 'cm', baseline: '8-9 cm' },
      { label: 'Stroke Volume', value: '72', unit: 'mL/beat', baseline: '60-80 mL' },
      { label: 'Cardiac Output', value: '5.1', unit: 'L/min', baseline: '4.8-6.0 L/min' },
      { label: 'Left Ventricle Wall', value: '10.5', unit: 'mm', baseline: '9-11 mm' },
    ],
    structures: [
      { id: 'h-ra', name: 'Right Atrium', type: 'Chamber', description: 'Receives deoxygenated venous return from SVC & IVC', status: 'nominal', anatomicalCode: 'FMA:7088' },
      { id: 'h-rv', name: 'Right Ventricle', type: 'Chamber', description: 'Ejects deoxygenated blood through pulmonary trunk into lungs', status: 'nominal', anatomicalCode: 'FMA:7098' },
      { id: 'h-la', name: 'Left Atrium', type: 'Chamber', description: 'Receives oxygenated blood from four pulmonary veins', status: 'nominal', anatomicalCode: 'FMA:7101' },
      { id: 'h-lv', name: 'Left Ventricle', type: 'Chamber', description: 'Thick-walled high-pressure pump into systemic aorta', status: 'nominal', anatomicalCode: 'FMA:7102' },
      { id: 'h-av', name: 'Aortic Valve', type: 'Semilunar Valve', description: 'Tricuspid valve preventing retrograde aortic reflux into LV', status: 'nominal', anatomicalCode: 'FMA:7243' },
      { id: 'h-mv', name: 'Mitral (Bicuspid) Valve', type: 'Atrioventricular Valve', description: 'Dual-cusp valve between left atrium and left ventricle', status: 'nominal', anatomicalCode: 'FMA:7235' },
      { id: 'h-tv', name: 'Tricuspid Valve', type: 'Atrioventricular Valve', description: 'Triple-cusp valve between right atrium and right ventricle', status: 'nominal', anatomicalCode: 'FMA:7234' },
      { id: 'h-pv', name: 'Pulmonary Valve', type: 'Semilunar Valve', description: 'Controls egress from right ventricle to pulmonary artery', status: 'nominal', anatomicalCode: 'FMA:7245' },
      { id: 'h-ao', name: 'Ascending Aorta', type: 'Great Vessel', description: 'Primary systemic distribution conduit (2.8 cm caliber)', status: 'nominal', anatomicalCode: 'FMA:3734' },
      { id: 'h-pa', name: 'Pulmonary Trunk & Arteries', type: 'Great Vessel', description: 'Bifurcating conduit delivering venous blood to lung hilum', status: 'nominal', anatomicalCode: 'FMA:66324' },
    ],
    bloodSupply: {
      arterial: 'Left & Right Coronary Arteries (LCA, RCA, LAD)',
      venous: 'Coronary Sinus draining into Right Atrium',
      perfusionRate: '250 mL/min (5% total resting cardiac output)',
      vascularResistance: '18 mmHg·min/L coronary vascular resistance',
    },
    telemetryMetrics: [
      { label: 'Resting Heart Rate', value: '72 BPM', status: 'nominal', normalRange: '60 - 100 BPM', flightTolerance: '55 - 110 BPM' },
      { label: 'Blood Pressure', value: '118/76 mmHg', status: 'nominal', normalRange: '< 120/80 mmHg', flightTolerance: '95/60 - 140/90' },
      { label: 'Left Ventricle Ejection Fraction', value: '64%', status: 'nominal', normalRange: '55% - 70%', flightTolerance: '50% - 75%' },
      { label: 'Mean Arterial Pressure (MAP)', value: '90 mmHg', status: 'nominal', normalRange: '70 - 105 mmHg', flightTolerance: '65 - 110 mmHg' },
    ],
    chartConfig: {
      title: 'Left Ventricle Pressure-Volume Dynamics (Wiggers Loop)',
      yAxisLabel: 'LV Pressure (mmHg)',
      xAxisLabel: 'Cardiac Cycle Phase',
      primaryLegend: 'LV Intracardiac Pressure',
      secondaryLegend: 'Aortic Arterial Pressure',
      data: [
        { name: 'End Diastole', value: 12, secondary: 78, baseline: 10 },
        { name: 'Isovolumic Contraction', value: 78, secondary: 80, baseline: 75 },
        { name: 'Rapid Ejection', value: 118, secondary: 116, baseline: 120 },
        { name: 'Reduced Ejection', value: 106, secondary: 105, baseline: 105 },
        { name: 'Isovolumic Relaxation', value: 25, secondary: 88, baseline: 20 },
        { name: 'Rapid Inflow', value: 8, secondary: 84, baseline: 7 },
        { name: 'Diastasis', value: 10, secondary: 80, baseline: 8 },
        { name: 'Atrial Systole', value: 14, secondary: 77, baseline: 12 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Pulmonary Circulation', relationType: 'Direct Vascular Conduit', pathway: 'Pulmonary Trunk → Alveolar Capillaries → Pulmonary Veins', functionalRole: 'Deoxygenated blood re-oxygenation & carbon dioxide elimination', direction: 'reciprocal' },
      { targetSystem: 'Systemic Arterial Tree', relationType: 'Hydraulic Delivery', pathway: 'Ascending Aorta → Brachiocephalic, Carotid, Subclavian, Descending Aorta', functionalRole: 'Nutrient, electrolyte, and high-pressure oxygen delivery to all organ beds', direction: 'efferent' },
      { targetSystem: 'Autonomic Nervous System', relationType: 'Neural Pacemaker Regulation', pathway: 'Vagus Nerve (CN X, parasympathetic) & Cardiac Sympathetic Plexus (T1-T4)', functionalRole: 'Chronotropic, inotropic, and dromotropic rate modulation', direction: 'afferent' },
      { targetSystem: 'Renal-Adrenal Axis', relationType: 'Volume & Pressure Homeostasis', pathway: 'Atrial Natriuretic Peptide (ANP) release vs Renin-Angiotensin cascade', functionalRole: 'Extracellular fluid volume regulation and systemic vascular tone control', direction: 'reciprocal' },
    ],
    crossSectionLabels: [
      { id: 'cs-myo', name: 'Myocardium Layer', x: 28, y: 46, details: 'Striated cardiac muscle fibers arranged in helical spiral bundles' },
      { id: 'cs-sep', name: 'Interventricular Septum', x: 50, y: 55, details: 'Muscular dividing wall separating high-pressure LV from low-pressure RV' },
      { id: 'cs-pap', name: 'Papillary Muscles & Chordae', x: 68, y: 64, details: 'Tendinous cords tethering atrioventricular valve leaflets against prolapse' },
      { id: 'cs-epi', name: 'Visceral Pericardium (Epicardium)', x: 18, y: 32, details: 'Serous mesothelial outer envelope containing coronary vasculature' },
    ],
  },

  lungs: {
    id: 'lungs',
    name: 'Lungs & Respiratory Tree',
    latinName: 'Pulmones',
    system: 'Respiratory System',
    location: 'Thoracic Cavity (Bilateral Pleural Cavities flanking Mediastinum)',
    color: '#06b6d4',
    position3D: [0, 2.95, 0.15],
    scale3D: [0.88, 0.65, 0.42],
    meshType: 'bilateral',
    characteristics: [
      'Bilateral spongy parenchymal gas-exchange organs',
      'Right lung: 3 lobes (Superior, Middle, Inferior) with 2 fissures',
      'Left lung: 2 lobes (Superior, Inferior) with cardiac notch',
      '300 million micro-alveolar gas-diffusion units (~100 m² surface)',
    ],
    dimensions: [
      { label: 'Total Lung Capacity (TLC)', value: '6.0', unit: 'L', baseline: '5.8-6.2 L' },
      { label: 'Vital Capacity (VC)', value: '4.8', unit: 'L', baseline: '4.5-5.0 L' },
      { label: 'Tidal Volume (Vt)', value: '520', unit: 'mL', baseline: '500 mL' },
      { label: 'Right Lung Mass', value: '620', unit: 'g', baseline: '600-650 g' },
      { label: 'Left Lung Mass', value: '560', unit: 'g', baseline: '550-580 g' },
      { label: 'Alveolar Surface Area', value: '118', unit: 'm²', baseline: '100-140 m²' },
    ],
    structures: [
      { id: 'l-r-sup', name: 'Right Superior Lobe', type: 'Parenchyma', description: 'Apical, anterior, and posterior bronchopulmonary segments', status: 'nominal', anatomicalCode: 'FMA:7337' },
      { id: 'l-r-mid', name: 'Right Middle Lobe', type: 'Parenchyma', description: 'Lateral and medial bronchopulmonary segments', status: 'nominal', anatomicalCode: 'FMA:7338' },
      { id: 'l-r-inf', name: 'Right Inferior Lobe', type: 'Parenchyma', description: 'Superior, medial-basal, anterior-basal, lateral-basal segments', status: 'nominal', anatomicalCode: 'FMA:7339' },
      { id: 'l-l-sup', name: 'Left Superior Lobe & Lingula', type: 'Parenchyma', description: 'Apicoposterior and anterior segments with cardiac notch', status: 'nominal', anatomicalCode: 'FMA:7340' },
      { id: 'l-l-inf', name: 'Left Inferior Lobe', type: 'Parenchyma', description: 'Large posterior-basal gas exchange parenchymal zone', status: 'nominal', anatomicalCode: 'FMA:7341' },
      { id: 'l-tra', name: 'Trachea', type: 'Conducting Airway', description: '10-12 cm fibrocartilaginous tube with C-shaped hyaline rings', status: 'nominal', anatomicalCode: 'FMA:7394' },
      { id: 'l-pri-b', name: 'Main (Primary) Bronchi', type: 'Conducting Airway', description: 'Right wider/steeper angle; left longer/more horizontal', status: 'nominal', anatomicalCode: 'FMA:7405' },
      { id: 'l-alv', name: 'Alveolar-Capillary Membrane', type: 'Diffusive Substructure', description: '0.2-0.5 µm thin barrier (Type I pneumocytes + capillary endothelium)', status: 'nominal', anatomicalCode: 'FMA:84120' },
      { id: 'l-ple', name: 'Visceral & Parietal Pleura', type: 'Serous Membrane', description: 'Double-layered envelope maintaining negative intrapleural pressure', status: 'nominal', anatomicalCode: 'FMA:9583' },
    ],
    bloodSupply: {
      arterial: 'Pulmonary Arteries (functional deox) + Bronchial Arteries (nutritive ox)',
      venous: 'Four Pulmonary Veins (into LA) + Azygos/Hemiazygos veins',
      perfusionRate: '5.0 L/min (receives 100% of Right Ventricle cardiac output)',
      vascularResistance: '1.5 mmHg·min/L (extremely low pulmonary vascular resistance)',
    },
    telemetryMetrics: [
      { label: 'Respiratory Rate', value: '14 BrPM', status: 'nominal', normalRange: '12 - 20 BrPM', flightTolerance: '10 - 24 BrPM' },
      { label: 'Oxygen Saturation (SpO₂)', value: '98%', status: 'nominal', normalRange: '95% - 100%', flightTolerance: '93% - 100%' },
      { label: 'End-Tidal CO₂ (EtCO₂)', value: '36 mmHg', status: 'nominal', normalRange: '35 - 45 mmHg', flightTolerance: '32 - 48 mmHg' },
      { label: 'FEV1 / FVC Ratio', value: '82%', status: 'nominal', normalRange: '> 75%', flightTolerance: '> 70%' },
    ],
    chartConfig: {
      title: 'Spirometric Flow-Volume Loop (Tidal & Forced Vital Capacity)',
      yAxisLabel: 'Airflow Velocity (L/s)',
      xAxisLabel: 'Lung Volume (Liters)',
      primaryLegend: 'Expiratory / Inspiratory Flow Curve',
      secondaryLegend: 'Predicted Baseline Loop',
      data: [
        { name: 'Residual Vol (1.2L)', value: 0, secondary: 0, baseline: 0 },
        { name: 'PEF Peak (2.0L)', value: 9.8, secondary: 9.5, baseline: 10.0 },
        { name: 'MEF 75% (3.0L)', value: 7.2, secondary: 7.0, baseline: 7.4 },
        { name: 'MEF 50% (4.2L)', value: 4.8, secondary: 4.6, baseline: 5.0 },
        { name: 'MEF 25% (5.4L)', value: 2.1, secondary: 2.0, baseline: 2.2 },
        { name: 'TLC Point (6.0L)', value: 0, secondary: 0, baseline: 0 },
        { name: 'Insp Mid-point (4.0L)', value: -4.5, secondary: -4.2, baseline: -4.4 },
        { name: 'MIF 50% (3.0L)', value: -5.6, secondary: -5.3, baseline: -5.5 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Cardiovascular Core', relationType: 'Direct Vascular Interlink', pathway: 'Pulmonary Trunk & Pulmonary Vein Circuit', functionalRole: 'Re-oxygenation of total systemic cardiac output and pH acid-base buffering', direction: 'reciprocal' },
      { targetSystem: 'Environmental Life Support (ECLSS)', relationType: 'Atmospheric Gas Coupling', pathway: 'Habitat Cabin Air Scrubbers & Partial Pressure Regulators', functionalRole: 'Removal of exhaled 1.0 kg CO₂/day per crew member and cabin O₂ replenishment', direction: 'efferent' },
      { targetSystem: 'Central Nervous System (Medulla)', relationType: 'Neural Respiratory Drive', pathway: 'Phrenic Nerve (C3-C5) & Intercostal Nerves', functionalRole: 'Automated diaphragm contraction and hypercapnic ventilatory response', direction: 'afferent' },
      { targetSystem: 'Renal Buffer System', relationType: 'Acid-Base Balance', pathway: 'Bicarbonate-Carbonic Acid Buffer System (CO₂ + H₂O ↔ H₂CO₃ ↔ H⁺ + HCO₃⁻)', functionalRole: 'Respiratory compensation for metabolic alkalosis/acidosis', direction: 'reciprocal' },
    ],
    crossSectionLabels: [
      { id: 'cs-bronch', name: 'Secondary Lobar Bronchus', x: 42, y: 35, details: 'Cartilage-supported conduit branching to distinct bronchopulmonary lobes' },
      { id: 'cs-alv-sac', name: 'Alveolar Sac Cluster', x: 74, y: 62, details: 'Terminal grape-like cluster wrapped in dense capillary mesh for O₂/CO₂ diffusion' },
      { id: 'cs-hilum', name: 'Pulmonary Hilum', x: 34, y: 48, details: 'Medial wedge root transmitting pulmonary artery, dual veins, and lymphatics' },
      { id: 'cs-dia-base', name: 'Diaphragmatic Surface (Base)', x: 50, y: 88, details: 'Concave inferior base resting on convex dome of the diaphragm' },
    ],
  },

  brain: {
    id: 'brain',
    name: 'Brain & Central Nervous System',
    latinName: 'Encephalon',
    system: 'Nervous System',
    location: 'Cranial Cavity (Neurocranium within anterior, middle & posterior cranial fossae)',
    color: '#38bdf8',
    position3D: [0, 4.38, 0.05],
    scale3D: [0.46, 0.52, 0.50],
    meshType: 'sphere',
    characteristics: [
      '86 billion neurons interconnected via ~100 trillion synapses',
      'High metabolic demand: consumes 20% total resting oxygen & glucose',
      'Blood-Brain Barrier (BBB) with tight endothelial junctions',
      'Suspended in 150 mL Cerebrospinal Fluid (CSF) with buoyant cushion',
    ],
    dimensions: [
      { label: 'Cerebral Mass', value: '1,380', unit: 'g', baseline: '1,300-1,450 g' },
      { label: 'Anteroposterior Length', value: '16.5', unit: 'cm', baseline: '16-17 cm' },
      { label: 'Transverse Width', value: '14.0', unit: 'cm', baseline: '13.5-14.5 cm' },
      { label: 'Cerebrospinal Fluid Vol', value: '150', unit: 'mL', baseline: '130-160 mL' },
      { label: 'Intracranial Pressure (ICP)', value: '11.5', unit: 'mmHg', baseline: '7-15 mmHg' },
      { label: 'Cerebral Perfusion Pressure', value: '78', unit: 'mmHg', baseline: '70-90 mmHg' },
    ],
    structures: [
      { id: 'b-fc', name: 'Frontal Lobe & Prefrontal Cortex', type: 'Cerebral Cortex', description: 'Executive reasoning, motor planning, spatial problem-solving', status: 'nominal', anatomicalCode: 'FMA:61824' },
      { id: 'b-tc', name: 'Temporal Lobe', type: 'Cerebral Cortex', description: 'Auditory processing, language comprehension, hippocampus memory consolidation', status: 'nominal', anatomicalCode: 'FMA:61825' },
      { id: 'b-pc', name: 'Parietal Lobe', type: 'Cerebral Cortex', description: 'Somatosensory integration, visual-spatial coordinate mapping', status: 'nominal', anatomicalCode: 'FMA:61826' },
      { id: 'b-oc', name: 'Occipital Lobe', type: 'Cerebral Cortex', description: 'Primary visual cortex (V1) & visual association streams', status: 'nominal', anatomicalCode: 'FMA:61827' },
      { id: 'b-cb', name: 'Cerebellum', type: 'Infratentorial Structure', description: 'Fine motor coordination, balance calibration, vestibulo-ocular reflex', status: 'nominal', anatomicalCode: 'FMA:67944' },
      { id: 'b-bs', name: 'Brainstem (Midbrain, Pons, Medulla)', type: 'Autonomic Core', description: 'Autonomic respiratory and cardiovascular centers; cranial nerve nuclei', status: 'nominal', anatomicalCode: 'FMA:76878' },
      { id: 'b-th', name: 'Thalamus & Diencephalon', type: 'Relay Substructure', description: 'Sensory relay hub routing all sensory modalities (except olfaction) to cortex', status: 'nominal', anatomicalCode: 'FMA:62007' },
      { id: 'b-vs', name: 'Ventricular System (Lateral, 3rd, 4th)', type: 'CSF Cavities', description: 'Choroid plexus producing 500 mL CSF/day, fluid cushion & metabolic clearance', status: 'nominal', anatomicalCode: 'FMA:78447' },
    ],
    bloodSupply: {
      arterial: 'Circle of Willis (Bilateral Internal Carotid & Vertebral-Basilar Arteries)',
      venous: 'Dural Venous Sinuses (Superior Sagittal, Transverse) → Internal Jugular Veins',
      perfusionRate: '750 mL/min (15% total cardiac output, constant auto-regulation)',
      vascularResistance: 'Auto-regulated between MAP 60 - 160 mmHg',
    },
    telemetryMetrics: [
      { label: 'Cognitive Readiness Score', value: '94 / 100', status: 'nominal', normalRange: '80 - 100', flightTolerance: '75 - 100' },
      { label: 'Estimated Intracranial Pressure (ICP)', value: '11.5 mmHg', status: 'nominal', normalRange: '7 - 15 mmHg', flightTolerance: '5 - 18 mmHg' },
      { label: 'Vestibular Conflict / SAS Grade', value: 'Grade 0 (Adapted)', status: 'nominal', normalRange: 'Grade 0', flightTolerance: 'Grade 0 - 1' },
      { label: 'Cerebral Blood Flow (CBF)', value: '54 mL/100g/min', status: 'nominal', normalRange: '50 - 60', flightTolerance: '45 - 65' },
    ],
    chartConfig: {
      title: 'Continuous Quantitative Electroencephalogram (qEEG) Spectral Bands',
      yAxisLabel: 'Relative Power Spectral Density (%)',
      xAxisLabel: 'Neural Frequency Bands',
      primaryLegend: 'Active Mission Power Spectral Distribution',
      secondaryLegend: 'Pre-flight Resting Baseline',
      data: [
        { name: 'Delta (0.5-4Hz)', value: 14, secondary: 15, baseline: 15 },
        { name: 'Theta (4-8Hz)', value: 22, secondary: 20, baseline: 18 },
        { name: 'Alpha (8-12Hz)', value: 34, secondary: 36, baseline: 38 },
        { name: 'Beta (12-30Hz)', value: 24, secondary: 23, baseline: 22 },
        { name: 'Gamma (30-45Hz)', value: 6, secondary: 6, baseline: 7 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Ophthalmic & SANS Axis', relationType: 'Hydrostatic Fluid Coupling', pathway: 'Optic Nerve Sheath & Subarachnoid CSF Space', functionalRole: 'Transmission of elevated cephalad CSF pressure causing optic disc edema / hyperopic shift', direction: 'efferent' },
      { targetSystem: 'Endocrine Pituitary Axis', relationType: 'Neurohumoral Master Control', pathway: 'Infundibulum / Hypothalamic-Hypophyseal Portal System', functionalRole: 'ACTH, TSH, ADH, and GH circadian release coordination', direction: 'efferent' },
      { targetSystem: 'Peripheral Autonomic System', relationType: 'Sympathetic/Parasympathetic Outflow', pathway: 'Cranial Nerves (Vagus) & Spinal Thoracolumbar Chains', functionalRole: 'Total systemic blood pressure, cardiac chronotropy, and gut peristalsis control', direction: 'efferent' },
      { targetSystem: 'Vestibular Semicircular Canals', relationType: 'Sensory Afferent Feedback', pathway: 'Vestibulocochlear Nerve (CN VIII)', functionalRole: 'Otolith un-weighting in 0-G causing Space Adaptation Syndrome (SAS) motion cue conflict', direction: 'afferent' },
    ],
    crossSectionLabels: [
      { id: 'cs-cortex', name: 'Cerebral Gray Matter Cortex', x: 25, y: 22, details: '2-4 mm folded layer packed with neuronal cell bodies and unmyelinated dendrites' },
      { id: 'cs-wm', name: 'Subcortical White Matter Tracts', x: 45, y: 38, details: 'Myelinated axonal bundles connecting cortical regions and projection pathways' },
      { id: 'cs-vent', name: 'Lateral Ventricle Anterior Horn', x: 50, y: 50, details: 'CSF-filled central cavity buffered against microgravity intracranial pressure fluctuations' },
      { id: 'cs-pons', name: 'Brainstem & Cerebellar Peduncle', x: 52, y: 76, details: 'Critical motor relay highway coordinating voluntary movement and automatic autonomic survival loops' },
    ],
  },

  liver: {
    id: 'liver',
    name: 'Liver & Hepatic System',
    latinName: 'Hepar',
    system: 'Hepato-Metabolic System',
    location: 'Right Hypochondrium and Epigastrium (Subdiaphragmatic, protected by ribs 7-11)',
    color: '#a16207',
    position3D: [0.15, 2.30, 0.22],
    scale3D: [0.52, 0.38, 0.35],
    meshType: 'lobed',
    characteristics: [
      'Largest internal parenchymal gland in human body',
      'Dual vascular inflow (75% portal vein, 25% hepatic artery)',
      'Performs >500 distinct vital metabolic and detoxification functions',
      'Synthesizes 90% of plasma proteins (Albumin, Coagulation factors I-XII)',
    ],
    dimensions: [
      { label: 'Hepatic Mass', value: '1,520', unit: 'g', baseline: '1,400-1,650 g' },
      { label: 'Transverse Diameter', value: '22.0', unit: 'cm', baseline: '20-23 cm' },
      { label: 'Vertical Height', value: '16.5', unit: 'cm', baseline: '15-18 cm' },
      { label: 'Hepatic Blood Flow', value: '1,450', unit: 'mL/min', baseline: '1,350-1,550 mL/min' },
      { label: 'Portal Pressure', value: '7.0', unit: 'mmHg', baseline: '5-8 mmHg' },
      { label: 'Bile Production', value: '750', unit: 'mL/day', baseline: '600-1,000 mL/day' },
    ],
    structures: [
      { id: 'liv-rl', name: 'Right Hepatic Lobe', type: 'Parenchyma', description: 'Occupies ~5/6th of total hepatic volume; segments V, VI, VII, VIII', status: 'nominal', anatomicalCode: 'FMA:7196' },
      { id: 'liv-ll', name: 'Left Hepatic Lobe', type: 'Parenchyma', description: 'Flattened triangular lobe extending into epigastrium; segments II, III, IV', status: 'nominal', anatomicalCode: 'FMA:7197' },
      { id: 'liv-cl', name: 'Caudate Lobe', type: 'Autonomous Segment', description: 'Segment I; independent venous drainage directly into IVC', status: 'nominal', anatomicalCode: 'FMA:14497' },
      { id: 'liv-ql', name: 'Quadrate Lobe', type: 'Parenchyma', description: 'Segment IVb adjacent to gallbladder fossa', status: 'nominal', anatomicalCode: 'FMA:14498' },
      { id: 'liv-pv', name: 'Hepatic Portal Vein', type: 'Vascular Inflow', description: 'Carries nutrient-rich, low-oxygen blood from gastrointestinal tract and spleen', status: 'nominal', anatomicalCode: 'FMA:14327' },
      { id: 'liv-ha', name: 'Proper Hepatic Artery', type: 'Vascular Inflow', description: 'Branch of celiac trunk delivering high-pressure oxygenated arterial blood', status: 'nominal', anatomicalCode: 'FMA:14771' },
      { id: 'liv-bd', name: 'Common Hepatic & Bile Ducts', type: 'Biliary Egress', description: 'Transports bile acids to duodenum via ampulla of Vater', status: 'nominal', anatomicalCode: 'FMA:14631' },
      { id: 'liv-sin', name: 'Hepatic Sinusoids & Kupffer Cells', type: 'Microvasculature', description: 'Fenestrated capillaries with resident macrophages clearing portal bacteria', status: 'nominal', anatomicalCode: 'FMA:14555' },
    ],
    bloodSupply: {
      arterial: 'Proper Hepatic Artery (from Celiac Trunk, ~350 mL/min)',
      venous: 'Hepatic Portal Vein (inflow ~1,100 mL/min); Hepatic Veins (outflow into IVC)',
      perfusionRate: '1,450 mL/min (receives ~28% of total cardiac output)',
      vascularResistance: 'Extremely low resistance portal bed (gradient ~3-5 mmHg)',
    },
    telemetryMetrics: [
      { label: 'Alanine Aminotransferase (ALT)', value: '24 U/L', status: 'nominal', normalRange: '7 - 56 U/L', flightTolerance: '5 - 65 U/L' },
      { label: 'Aspartate Aminotransferase (AST)', value: '22 U/L', status: 'nominal', normalRange: '10 - 40 U/L', flightTolerance: '8 - 48 U/L' },
      { label: 'Total Serum Albumin', value: '4.4 g/dL', status: 'nominal', normalRange: '3.5 - 5.5 g/dL', flightTolerance: '3.4 - 5.6 g/dL' },
      { label: 'Total Serum Bilirubin', value: '0.8 mg/dL', status: 'nominal', normalRange: '0.2 - 1.2 mg/dL', flightTolerance: '0.1 - 1.4 mg/dL' },
    ],
    chartConfig: {
      title: 'Circadian Glycogen Storage & Hepatic Clearance Kinetics',
      yAxisLabel: 'Hepatic Glycogen Stores (g) / Clearance Rate (%)',
      xAxisLabel: 'Mission Sol Hourly Phase (00:00 - 24:00)',
      primaryLegend: 'Liver Glycogen Reserves (g)',
      secondaryLegend: 'Xenobiotic / Pharmaceutical Clearance Rate (%)',
      data: [
        { name: '02:00', value: 85, secondary: 72, baseline: 80 },
        { name: '06:00 (Wake)', value: 65, secondary: 88, baseline: 60 },
        { name: '10:00 (Post-Meal)', value: 110, secondary: 95, baseline: 105 },
        { name: '14:00 (EVA Workout)', value: 88, secondary: 90, baseline: 90 },
        { name: '18:00 (Dinner)', value: 125, secondary: 84, baseline: 120 },
        { name: '22:00 (Sleep Prep)', value: 105, secondary: 76, baseline: 100 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Digestive & Gastrointestinal', relationType: 'First-Pass Portal Drain', pathway: 'Superior & Inferior Mesenteric Veins → Portal Vein', functionalRole: 'Immediate detoxification of absorbed nutrients, medications, and metabolic byproducts', direction: 'afferent' },
      { targetSystem: 'Cardiovascular Return', relationType: 'Major Venous Effluent', pathway: 'Right, Middle, and Left Hepatic Veins → Inferior Vena Cava', functionalRole: 'Delivery of purified blood back to heart right atrium', direction: 'efferent' },
      { targetSystem: 'Endocrine Glucose Regulation', relationType: 'Metabolic Buffering', pathway: 'Insulin/Glucagon ratio signaling from Pancreatic islets', functionalRole: 'Dynamic gluconeogenesis vs glycogenolysis blood sugar stabilization', direction: 'reciprocal' },
    ],
    crossSectionLabels: [
      { id: 'cs-lobule', name: 'Hepatic Classical Lobule', x: 35, y: 40, details: 'Hexagonal functional unit centered around a central vein with 6 portal triads' },
      { id: 'cs-sinu', name: 'Sinusoidal Endothelium', x: 62, y: 55, details: 'Discontinuous fenestrated capillaries facilitating direct contact between plasma and hepatocytes' },
      { id: 'cs-triad', name: 'Portal Triad (Artery, Vein, Duct)', x: 78, y: 32, details: 'Microscopic branch containing terminal portal venule, hepatic arteriole, and bile ductule' },
    ],
  },

  kidneys: {
    id: 'kidneys',
    name: 'Kidneys & Renal System',
    latinName: 'Renes',
    system: 'Renal / Urinary System',
    location: 'Retroperitoneal (Posterior Abdominal Wall, T12 to L3 Vertebrae)',
    color: '#e11d48',
    position3D: [0, 1.95, -0.08],
    scale3D: [0.72, 0.32, 0.28],
    meshType: 'bilateral',
    characteristics: [
      'Bean-shaped retroperitoneal bilateral filtration organs',
      'Contains 2 million microscopic nephron filtration units',
      'Filters 180 Liters of blood plasma daily, excreting 1.5 L urine',
      'Primary master controller of blood pressure via Renin-Angiotensin cascade',
    ],
    dimensions: [
      { label: 'Single Kidney Mass', value: '145', unit: 'g', baseline: '130-160 g' },
      { label: 'Length', value: '11.5', unit: 'cm', baseline: '10-12 cm' },
      { label: 'Transverse Width', value: '6.0', unit: 'cm', baseline: '5-7 cm' },
      { label: 'Anteroposterior Depth', value: '3.2', unit: 'cm', baseline: '3-4 cm' },
      { label: 'Glomerular Filtration Rate', value: '112', unit: 'mL/min/1.73m²', baseline: '90-125' },
      { label: 'Renal Blood Flow', value: '1,200', unit: 'mL/min', baseline: '1,100-1,300 mL/min' },
    ],
    structures: [
      { id: 'k-cor', name: 'Renal Cortex', type: 'Parenchyma', description: 'Outer granular zone containing glomeruli and convoluted tubules', status: 'nominal', anatomicalCode: 'FMA:15581' },
      { id: 'k-med', name: 'Renal Medulla (8-18 Pyramids)', type: 'Parenchyma', description: 'Striated pyramids containing loops of Henle and collecting ducts', status: 'nominal', anatomicalCode: 'FMA:15582' },
      { id: 'k-pel', name: 'Renal Pelvis', type: 'Collecting Conduit', description: 'Funnel-shaped basin receiving urine from major calyces', status: 'nominal', anatomicalCode: 'FMA:15615' },
      { id: 'k-cal', name: 'Major & Minor Calyces', type: 'Collecting Cups', description: 'Cup-like chambers surrounding renal papillae collecting initial urine', status: 'nominal', anatomicalCode: 'FMA:15616' },
      { id: 'k-neph', name: 'Nephron Filtration Units', type: 'Microscopic Unit', description: 'Glomerular tuft enclosed in Bowman capsule + proximal/distal tubules', status: 'nominal', anatomicalCode: 'FMA:17693' },
      { id: 'k-ure', name: 'Ureters', type: 'Muscular Tube', description: '25 cm retroperitoneal muscular ducts propelling urine to bladder via peristalsis', status: 'nominal', anatomicalCode: 'FMA:9702' },
      { id: 'k-ra', name: 'Renal Arteries', type: 'Vascular Inflow', description: 'Direct high-flow branches from abdominal aorta (20% cardiac output)', status: 'nominal', anatomicalCode: 'FMA:14751' },
      { id: 'k-rv', name: 'Renal Veins', type: 'Vascular Outflow', description: 'High-caliber conduits returning filtered venous blood into IVC', status: 'nominal', anatomicalCode: 'FMA:14337' },
    ],
    bloodSupply: {
      arterial: 'Right & Left Renal Arteries (branches directly from Abdominal Aorta)',
      venous: 'Right & Left Renal Veins draining directly into Inferior Vena Cava',
      perfusionRate: '1,200 mL/min (20-22% of total resting cardiac output)',
      vascularResistance: 'High-pressure glomerular capillaries (55 mmHg) vs low-pressure peritubular (13 mmHg)',
    },
    telemetryMetrics: [
      { label: 'Glomerular Filtration Rate (eGFR)', value: '112 mL/min', status: 'nominal', normalRange: '> 90 mL/min', flightTolerance: '> 80 mL/min' },
      { label: 'Serum Creatinine', value: '0.92 mg/dL', status: 'nominal', normalRange: '0.7 - 1.3 mg/dL', flightTolerance: '0.6 - 1.4 mg/dL' },
      { label: 'Blood Urea Nitrogen (BUN)', value: '14 mg/dL', status: 'nominal', normalRange: '7 - 20 mg/dL', flightTolerance: '6 - 22 mg/dL' },
      { label: 'Urine Specific Gravity', value: '1.018', status: 'nominal', normalRange: '1.005 - 1.030', flightTolerance: '1.010 - 1.025' },
    ],
    chartConfig: {
      title: 'Renal Glomerular Clearance & Electrolyte Excretion Gradient',
      yAxisLabel: 'Filtration Clearance (mL/min) / Excretion (mEq/L)',
      xAxisLabel: 'Mission Day Hydrostatic Fluid Shift Timecourse',
      primaryLegend: 'Estimated GFR (mL/min/1.73m²)',
      secondaryLegend: 'Urinary Sodium Clearance (mEq/L)',
      data: [
        { name: 'Launch Day', value: 118, secondary: 140, baseline: 110 },
        { name: 'Sol 10 (Fluid Shift)', value: 124, secondary: 165, baseline: 110 },
        { name: 'Sol 30 (Adaptation)', value: 115, secondary: 145, baseline: 110 },
        { name: 'Sol 60 (Steady)', value: 112, secondary: 135, baseline: 110 },
        { name: 'Sol 90', value: 110, secondary: 138, baseline: 110 },
        { name: 'Sol 142 (Current)', value: 112, secondary: 136, baseline: 110 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Cardiovascular Hemodynamics', relationType: 'Circulating Volume Regulator', pathway: 'Renin-Angiotensin-Aldosterone System (RAAS)', functionalRole: 'Maintenance of extracellular fluid volume and arterial blood pressure', direction: 'reciprocal' },
      { targetSystem: 'Urinary Bladder & Excretion', relationType: 'Continuous Fluid Delivery', pathway: 'Bilateral Ureteral Peristaltic Columns', functionalRole: 'Conveyance of hyperosmolar metabolic waste into urinary reservoir', direction: 'efferent' },
      { targetSystem: 'Skeletal Bone Mineral Homeostasis', relationType: 'Endocrine Activation', pathway: 'Calcitriol (1,25-(OH)₂D₃) synthesis and Phosphate excretion', functionalRole: 'Prevents hypercalciuria and nephrolithiasis (kidney stones in 0-G)', direction: 'reciprocal' },
    ],
    crossSectionLabels: [
      { id: 'cs-nephron', name: 'Glomerular Bowman Capsule', x: 28, y: 32, details: 'Afferent/efferent arterioles entering podocyte-covered fenestrated capillary ball' },
      { id: 'cs-pyramid', name: 'Medullary Collecting Duct Loop', x: 52, y: 56, details: 'Countercurrent multiplier creating hypertonic medullary interstitium' },
      { id: 'cs-hilus', name: 'Renal Hilum & Pelvic Funnel', x: 74, y: 48, details: 'Exit zone of renal vein and ureter, entry point of renal artery' },
    ],
  },

  stomach: {
    id: 'stomach',
    name: 'Stomach & Gastric Reservoir',
    latinName: 'Gaster / Ventriculus',
    system: 'Gastrointestinal System',
    location: 'Left Upper Quadrant & Epigastrium (Under Left Costal Margin, T10-L1)',
    color: '#f97316',
    position3D: [-0.10, 2.22, 0.25],
    scale3D: [0.36, 0.30, 0.26],
    meshType: 'sphere',
    characteristics: [
      'J-shaped muscular hollow organ of chemical & mechanical digestion',
      'Three smooth muscle coats (longitudinal, circular, oblique)',
      'Highly acidic environment (pH 1.5 - 2.0) via parietal cell HCl secretion',
      'Propels churned chyme through pyloric sphincter into duodenum',
    ],
    dimensions: [
      { label: 'Resting Volume', value: '1.2', unit: 'L', baseline: '1.0-1.5 L' },
      { label: 'Longitudinal Length', value: '25.0', unit: 'cm', baseline: '22-26 cm' },
      { label: 'Transverse Diameter', value: '11.0', unit: 'cm', baseline: '10-12 cm' },
      { label: 'Gastric Acid Output', value: '2.0', unit: 'L/day', baseline: '1.5-2.5 L/day' },
      { label: 'Gastric Emptying Half-time', value: '85', unit: 'min', baseline: '60-100 min' },
      { label: 'Intragastric pH', value: '1.8', unit: 'pH', baseline: '1.5-2.2' },
    ],
    structures: [
      { id: 'st-car', name: 'Cardia & Lower Esophageal Sphincter', type: 'Inflow Junction', description: 'Surrounds gastroesophageal junction, prevents acid reflux into esophagus', status: 'nominal', anatomicalCode: 'FMA:14560' },
      { id: 'st-fun', name: 'Gastric Fundus', type: 'Reservoir Dome', description: 'Dome-shaped upper reservoir trapping swallowing gases', status: 'nominal', anatomicalCode: 'FMA:14561' },
      { id: 'st-bod', name: 'Gastric Body (Corpus)', type: 'Main Reservoir', description: 'Main mixing chamber lined with acid-producing oxyntic glands', status: 'nominal', anatomicalCode: 'FMA:14562' },
      { id: 'st-ant', name: 'Pyloric Antrum & Canal', type: 'Muscular Pump', description: 'Thick muscular pump delivering rhythmic 3/min peristaltic contractions', status: 'nominal', anatomicalCode: 'FMA:14563' },
      { id: 'st-pyl', name: 'Pyloric Sphincter', type: 'Muscular Valve', description: 'Strong annular smooth muscle ring gating chyme passage into duodenum', status: 'nominal', anatomicalCode: 'FMA:14564' },
      { id: 'st-rug', name: 'Gastric Rugae Folds', type: 'Mucosal Architecture', description: 'Prominent longitudinal mucosal ridges expanding during food intake', status: 'nominal', anatomicalCode: 'FMA:14578' },
    ],
    bloodSupply: {
      arterial: 'Celiac Trunk branches: Left Gastric, Right Gastric, Right & Left Gastro-omental Arteries',
      venous: 'Right & Left Gastric Veins draining into Hepatic Portal Vein',
      perfusionRate: '350 mL/min (postprandial peak > 800 mL/min)',
      vascularResistance: 'Dynamic splanchnic resistance mediated by gastrin and secretin',
    },
    telemetryMetrics: [
      { label: 'Intragastric pH', value: '1.8 pH', status: 'nominal', normalRange: '1.5 - 2.5 pH', flightTolerance: '1.4 - 3.0 pH' },
      { label: 'Gastric Motility Frequency', value: '3.1 cycles/min', status: 'nominal', normalRange: '2.8 - 3.4 cpm', flightTolerance: '2.5 - 3.8 cpm' },
      { label: 'Nutrient Assimilation Index', value: '98%', status: 'nominal', normalRange: '> 92%', flightTolerance: '> 88%' },
    ],
    chartConfig: {
      title: 'Postprandial Gastric Acid Secretion & Antral Motility Rhythm',
      yAxisLabel: 'HCl Secretion (mEq/hr) / Antral Motility Index',
      xAxisLabel: 'Postprandial Minutes',
      primaryLegend: 'Active Gastric Acid Output',
      secondaryLegend: 'Antral Contraction Wave Amplitude',
      data: [
        { name: '0 min (Meal)', value: 10, secondary: 25, baseline: 10 },
        { name: '30 min', value: 38, secondary: 75, baseline: 35 },
        { name: '60 min', value: 55, secondary: 92, baseline: 52 },
        { name: '90 min', value: 46, secondary: 84, baseline: 44 },
        { name: '120 min', value: 28, secondary: 60, baseline: 25 },
        { name: '180 min', value: 12, secondary: 30, baseline: 12 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Duodenum & Small Intestine', relationType: 'Serial Chyme Egress', pathway: 'Pyloric Sphincter → Duodenal Bulb', functionalRole: 'Gradual metered delivery of acidic chyme for enzymatic breakdown', direction: 'efferent' },
      { targetSystem: 'Vagus Autonomic System', relationType: 'Cephalic-Gastric Reflex', pathway: 'Vagus Nerve (CN X) anterior and posterior trunks', functionalRole: 'Stimulation of acid secretion and receptive gastric relaxation', direction: 'afferent' },
      { targetSystem: 'Hepatic Portal Network', relationType: 'Direct Venous Egress', pathway: 'Left and Right Gastric Veins → Portal Vein', functionalRole: 'Immediate routing of absorbed alcohol, water, and weak acids to liver', direction: 'efferent' },
    ],
    crossSectionLabels: [
      { id: 'cs-mucosa', name: 'Gastric Mucosal Barrier', x: 26, y: 35, details: 'Bicarbonate-rich mucus gel layer shielding underlying cells from proteolytic pepsin' },
      { id: 'cs-muscle', name: 'Three-Layer Muscularis Externa', x: 50, y: 60, details: 'Outer longitudinal, middle circular, and inner oblique muscular mesh' },
    ],
  },

  pancreas: {
    id: 'pancreas',
    name: 'Pancreas & Endocrine Islets',
    latinName: 'Pancreas',
    system: 'Endocrine & Digestive System',
    location: 'Retroperitoneal (Epigastrium & Left Hypochondrium, L1-L2 Vertebrae)',
    color: '#fbbf24',
    position3D: [-0.02, 2.12, 0.12],
    scale3D: [0.38, 0.12, 0.14],
    meshType: 'cylinder',
    characteristics: [
      'Dual-function gland: 98% exocrine (acinar lobules) & 2% endocrine (islets)',
      'Produces 1.5 L alkaline pancreatic juice rich in enzymes daily',
      'Contains 1 million Islets of Langerhans regulating systemic glucose',
      'Direct secretion of insulin (beta cells) and glucagon (alpha cells)',
    ],
    dimensions: [
      { label: 'Glandular Mass', value: '95', unit: 'g', baseline: '80-110 g' },
      { label: 'Transverse Length', value: '15.0', unit: 'cm', baseline: '14-16 cm' },
      { label: 'Vertical Height', value: '4.2', unit: 'cm', baseline: '3.5-4.5 cm' },
      { label: 'Insulin Production', value: '42', unit: 'IU/day', baseline: '35-50 IU/day' },
      { label: 'Exocrine Volume', value: '1,400', unit: 'mL/day', baseline: '1,200-1,600 mL/day' },
      { label: 'Main Duct Caliber', value: '2.8', unit: 'mm', baseline: '2-3 mm' },
    ],
    structures: [
      { id: 'p-hd', name: 'Pancreatic Head', type: 'Glandular Region', description: 'Nestled securely within the C-loop of the duodenum', status: 'nominal', anatomicalCode: 'FMA:15861' },
      { id: 'p-nk', name: 'Pancreatic Neck', type: 'Glandular Region', description: 'Constricted segment overlying superior mesenteric vessels', status: 'nominal', anatomicalCode: 'FMA:15862' },
      { id: 'p-bd', name: 'Pancreatic Body', type: 'Glandular Region', description: 'Main prismatic horizontal segment traversing anterior to aorta', status: 'nominal', anatomicalCode: 'FMA:15863' },
      { id: 'p-tl', name: 'Pancreatic Tail', type: 'Glandular Region', description: 'Tapering lateral tip abutting splenic hilum; highest islet concentration', status: 'nominal', anatomicalCode: 'FMA:15864' },
      { id: 'p-dct', name: 'Main Pancreatic Duct (Wirsung)', type: 'Exocrine Conduit', description: 'Traverses gland from tail to head, joins common bile duct at ampulla', status: 'nominal', anatomicalCode: 'FMA:10421' },
      { id: 'p-isl', name: 'Islets of Langerhans', type: 'Endocrine Substructure', description: 'Alpha (glucagon), Beta (insulin), Delta (somatostatin) cell nests', status: 'nominal', anatomicalCode: 'FMA:63200' },
    ],
    bloodSupply: {
      arterial: 'Splenic Artery branches + Superior & Inferior Pancreaticoduodenal Arteries',
      venous: 'Splenic Vein and Superior Mesenteric Vein → Hepatic Portal Vein',
      perfusionRate: '150 mL/min (extremely high capillary islet density)',
      vascularResistance: 'Direct portal venous release delivering insulin first to liver',
    },
    telemetryMetrics: [
      { label: 'Fasting Blood Glucose', value: '92 mg/dL', status: 'nominal', normalRange: '70 - 100 mg/dL', flightTolerance: '65 - 115 mg/dL' },
      { label: 'Fasting Serum Insulin', value: '7.8 µIU/mL', status: 'nominal', normalRange: '2.6 - 24.9 µIU/mL', flightTolerance: '2.0 - 28.0 µIU/mL' },
      { label: 'Serum Amylase', value: '56 U/L', status: 'nominal', normalRange: '28 - 100 U/L', flightTolerance: '25 - 115 U/L' },
      { label: 'Serum Lipase', value: '32 U/L', status: 'nominal', normalRange: '10 - 60 U/L', flightTolerance: '10 - 70 U/L' },
    ],
    chartConfig: {
      title: 'Biphasic Insulin Secretion & Glucose Disposition Dynamics',
      yAxisLabel: 'Serum Insulin (µIU/mL) / Glucose (mg/dL)',
      xAxisLabel: 'Oral Glucose Challenge Phase (Minutes)',
      primaryLegend: 'Insulin Secretion Curve',
      secondaryLegend: 'Circulating Blood Glucose',
      data: [
        { name: '0 min (Basal)', value: 8, secondary: 90, baseline: 8 },
        { name: '15 min (1st Phase)', value: 48, secondary: 125, baseline: 45 },
        { name: '30 min', value: 34, secondary: 138, baseline: 32 },
        { name: '60 min (2nd Phase)', value: 52, secondary: 120, baseline: 50 },
        { name: '90 min', value: 36, secondary: 104, baseline: 35 },
        { name: '120 min', value: 14, secondary: 92, baseline: 12 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Hepatic Metabolic Reserve', relationType: 'Direct Humoral Inflow', pathway: 'Splenic Vein → Hepatic Portal Vein', functionalRole: 'First-pass hepatic extraction of insulin for glycogen synthesis', direction: 'efferent' },
      { targetSystem: 'Duodenal Digestion', relationType: 'Enzyme & Buffer Delivery', pathway: 'Duct of Wirsung → Ampulla of Vater', functionalRole: 'Neutralization of gastric acid and cleavage of fats, proteins, and carbohydrates', direction: 'efferent' },
    ],
    crossSectionLabels: [
      { id: 'cs-islet', name: 'Endocrine Islet of Langerhans', x: 38, y: 44, details: 'Vascularized cellular cluster producing insulin and glucagon' },
      { id: 'cs-acinar', name: 'Exocrine Acinar Cell Lobules', x: 65, y: 52, details: 'Zymogen-containing pyramidal cells secreting digestive proenzymes' },
    ],
  },

  spleen: {
    id: 'spleen',
    name: 'Spleen & Reticuloendothelial System',
    latinName: 'Splen / Lien',
    system: 'Lymphatic & Immune System',
    location: 'Left Hypochondrium (Posterior to stomach, adjacent to ribs 9-11)',
    color: '#9333ea',
    position3D: [-0.48, 2.25, 0.10],
    scale3D: [0.22, 0.28, 0.18],
    meshType: 'sphere',
    characteristics: [
      'Largest single organ of the lymphatic and immune system',
      'Dual compartment: Red pulp (RBC filter) & White pulp (lymphoid immunity)',
      'Removes senescent red blood cells and clears opsonized encapsulated bacteria',
      'Stores platelets (~30% of total body supply) and emergency monocytes',
    ],
    dimensions: [
      { label: 'Splenic Mass', value: '165', unit: 'g', baseline: '140-190 g' },
      { label: 'Longitudinal Length', value: '12.0', unit: 'cm', baseline: '11-13 cm' },
      { label: 'Transverse Width', value: '7.5', unit: 'cm', baseline: '7-8 cm' },
      { label: 'Thickness', value: '3.5', unit: 'cm', baseline: '3-4 cm' },
      { label: 'Splenic Blood Flow', value: '250', unit: 'mL/min', baseline: '200-300 mL/min' },
      { label: 'Platelet Sequestration', value: '32%', unit: 'of total', baseline: '30-35%' },
    ],
    structures: [
      { id: 'sp-cap', name: 'Fibroelastic Splenic Capsule', type: 'Envelope', description: 'Tough capsule with smooth muscle fibers allowing splenic volume regulation', status: 'nominal', anatomicalCode: 'FMA:15842' },
      { id: 'sp-rp', name: 'Red Pulp (Cords of Billroth)', type: 'Filtration Bed', description: 'Splenic cords & venous sinusoids filtering damaged and aged erythrocytes', status: 'nominal', anatomicalCode: 'FMA:15847' },
      { id: 'sp-wp', name: 'White Pulp & Malpighian Follicles', type: 'Immunological Zone', description: 'Periarteriolar lymphoid sheaths (PALS) rich in T-cells and B-cell germinal follicles', status: 'nominal', anatomicalCode: 'FMA:15846' },
      { id: 'sp-hil', name: 'Splenic Hilum', type: 'Vascular Axis', description: 'Medial fissure transmitting splenic artery, splenic vein, and lymphatics', status: 'nominal', anatomicalCode: 'FMA:15844' },
    ],
    bloodSupply: {
      arterial: 'Splenic Artery (Tortuous branch from Celiac Trunk)',
      venous: 'Splenic Vein joining Superior Mesenteric Vein to form Portal Vein',
      perfusionRate: '250 mL/min (5% of cardiac output)',
      vascularResistance: 'Open circulation sinusoidal flow through inter-endothelial slit filters',
    },
    telemetryMetrics: [
      { label: 'Total Platelet Count', value: '242 × 10³/µL', status: 'nominal', normalRange: '150 - 450 × 10³/µL', flightTolerance: '140 - 480 × 10³/µL' },
      { label: 'RBC Clearance Lifespan', value: '118 days', status: 'nominal', normalRange: '110 - 125 days', flightTolerance: '100 - 130 days' },
      { label: 'Splenic Volume Index', value: '210 cm³', status: 'nominal', normalRange: '180 - 250 cm³', flightTolerance: '170 - 270 cm³' },
    ],
    chartConfig: {
      title: 'Erythrocyte Deformability Clearance & Platelet Sequestration Profile',
      yAxisLabel: 'Relative Sequestration Clearance (%)',
      xAxisLabel: 'Erythrocyte Age (Days in Microgravity Orbit)',
      primaryLegend: 'RBC Mechanical Slit Clearance Efficacy',
      secondaryLegend: 'Platelet Storage Equilibrium',
      data: [
        { name: 'Day 10', value: 2, secondary: 30, baseline: 2 },
        { name: 'Day 40', value: 4, secondary: 31, baseline: 3 },
        { name: 'Day 80', value: 12, secondary: 32, baseline: 10 },
        { name: 'Day 100', value: 38, secondary: 33, baseline: 35 },
        { name: 'Day 120 (Senescent)', value: 92, secondary: 31, baseline: 90 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Cardiovascular Circulatory Pool', relationType: 'Hemolytic Filtration', pathway: 'Splenic Artery → Splenic Sinusoids → Splenic Vein', functionalRole: 'Continuous physical culling of rigid, spherocytic, or malformed erythrocytes', direction: 'reciprocal' },
      { targetSystem: 'Hepatic Reticuloendothelial Drain', relationType: 'Portal Waste Conduit', pathway: 'Splenic Vein → Hepatic Portal Vein', functionalRole: 'Delivery of hemoglobin breakdown products (unconjugated bilirubin) to liver', direction: 'efferent' },
    ],
    crossSectionLabels: [
      { id: 'cs-red-pulp', name: 'Red Pulp Sinusoids', x: 42, y: 48, details: 'Endothelial slits testing erythrocyte cell membrane deformability' },
      { id: 'cs-white-pulp', name: 'White Pulp PALS', x: 68, y: 34, details: 'Lymphoid follicle mounting humoral immune antibody responses against blood antigens' },
    ],
  },

  intestines: {
    id: 'intestines',
    name: 'Intestines & Enteric System',
    latinName: 'Intestinum (Tenue & Crassum)',
    system: 'Gastrointestinal & Enteric System',
    location: 'Abdominal & Pelvic Cavities (Central and peripheral frame)',
    color: '#f59e0b',
    position3D: [0, 1.45, 0.20],
    scale3D: [0.65, 0.52, 0.38],
    meshType: 'cylinder',
    characteristics: [
      'Dual division: Small intestine (~6 meters) & Large intestine (~1.5 meters)',
      'Small intestine possesses 250 m² villous/microvillous absorptive surface',
      'Large intestine absorbs water, electrolytes, and houses microbiome (~10¹⁴ bacteria)',
      'Enteric Nervous System (ENS) contains >500 million intrinsic neurons ("Second Brain")',
    ],
    dimensions: [
      { label: 'Total Absorptive Length', value: '7.5', unit: 'm', baseline: '7.0-8.2 m' },
      { label: 'Duodenum Length', value: '25.0', unit: 'cm', baseline: '22-28 cm' },
      { label: 'Jejuno-Ileum Length', value: '5.8', unit: 'm', baseline: '5.5-6.2 m' },
      { label: 'Colon Caliber', value: '6.5', unit: 'cm', baseline: '5.5-7.5 cm' },
      { label: 'Water Reabsorption Rate', value: '8.5', unit: 'L/day', baseline: '8.0-9.0 L/day' },
      { label: 'Transit Time', value: '28', unit: 'hours', baseline: '24-36 hours' },
    ],
    structures: [
      { id: 'i-duo', name: 'Duodenum', type: 'Small Intestine', description: 'C-shaped conduit receiving chyme, pancreatic juice, and bile', status: 'nominal', anatomicalCode: 'FMA:7206' },
      { id: 'i-jej', name: 'Jejunum', type: 'Small Intestine', description: 'Proximal 2/5th, tall plicae circulares for intense nutrient absorption', status: 'nominal', anatomicalCode: 'FMA:7207' },
      { id: 'i-ile', name: 'Ileum', type: 'Small Intestine', description: 'Distal 3/5th, contains Peyer patches (GALT) for mucosal immunity', status: 'nominal', anatomicalCode: 'FMA:7208' },
      { id: 'i-cec', name: 'Cecum & Vermiform Appendix', type: 'Large Intestine', description: 'Blind pouch receiving terminal ileum via ileocecal valve', status: 'nominal', anatomicalCode: 'FMA:14541' },
      { id: 'i-col', name: 'Colon (Ascending, Transverse, Descending, Sigmoid)', type: 'Large Intestine', description: 'Haustrated muscular frame concentrating fecal matter and electrolyte resorption', status: 'nominal', anatomicalCode: 'FMA:14543' },
      { id: 'i-rec', name: 'Rectum & Anal Canal', type: 'Distal Egress', description: 'Pelvic storage reservoir with internal and external sphincters', status: 'nominal', anatomicalCode: 'FMA:14544' },
    ],
    bloodSupply: {
      arterial: 'Superior Mesenteric Artery (small bowel to 2/3 transverse colon) + Inferior Mesenteric Artery',
      venous: 'Superior and Inferior Mesenteric Veins draining directly into Portal Vein',
      perfusionRate: '1,000 mL/min (up to 2,000 mL/min postprandially)',
      vascularResistance: 'Vasomotor regulation by sympathetic splanchnic nerves',
    },
    telemetryMetrics: [
      { label: 'Bowel Transit Velocity', value: '28 hr', status: 'nominal', normalRange: '20 - 40 hr', flightTolerance: '18 - 48 hr' },
      { label: 'Microbiome Diversity Index', value: '88%', status: 'nominal', normalRange: '> 80%', flightTolerance: '> 75%' },
      { label: 'Gut Mucosal Barrier Integrity', value: 'Optimal', status: 'nominal', normalRange: 'Optimal', flightTolerance: 'Optimal - Mild Dysbiosis' },
    ],
    chartConfig: {
      title: 'Nutrient Absorption Gradient & Migrating Motor Complex (MMC)',
      yAxisLabel: 'Relative Absorption Velocity (%) / Phase Contraction (mmHg)',
      xAxisLabel: 'Intestinal Segment (Duodenum → Colon)',
      primaryLegend: 'Carbohydrate / Amino Acid Absorption (%)',
      secondaryLegend: 'Lipid & Bile Salt Resorption Rate (%)',
      data: [
        { name: 'Duodenum', value: 35, secondary: 15, baseline: 30 },
        { name: 'Proximal Jejunum', value: 92, secondary: 55, baseline: 90 },
        { name: 'Distal Jejunum', value: 75, secondary: 78, baseline: 75 },
        { name: 'Terminal Ileum', value: 30, secondary: 95, baseline: 25 },
        { name: 'Ascending Colon', value: 8, secondary: 10, baseline: 8 },
        { name: 'Sigmoid Colon', value: 2, secondary: 2, baseline: 2 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Hepatic Clearance Gateway', relationType: 'Portal Resorption Pipeline', pathway: 'Mesenteric Veins → Hepatic Portal Vein', functionalRole: 'Immediate routing of all absorbed amino acids, sugars, and vitamins to liver', direction: 'efferent' },
      { targetSystem: 'Enteric Gut-Brain Axis', relationType: 'Bidirectional Neuro-Immune Link', pathway: 'Vagus Nerve & Microbial Short-Chain Fatty Acids (SCFAs)', functionalRole: 'Modulation of systemic mood, neurotransmitter balance (90% serotonin synthesized in gut)', direction: 'reciprocal' },
    ],
    crossSectionLabels: [
      { id: 'cs-villi', name: 'Intestinal Villi & Microvilli', x: 30, y: 35, details: 'Finger-like mucosal projections expanding absorptive surface with central lacteal' },
      { id: 'cs-ens', name: 'Myenteric (Auerbach) Plexus', x: 62, y: 65, details: 'Intrinsic neural ganglia coordinating smooth muscle peristaltic propulsions' },
    ],
  },

  bladder: {
    id: 'bladder',
    name: 'Urinary Bladder & Pelvic Excretion',
    latinName: 'Vesica Urinaria',
    system: 'Urinary Excretory System',
    location: 'Lesser Pelvis (Posterior to Pubic Symphysis, Subperitoneal)',
    color: '#0284c7',
    position3D: [0, 0.95, 0.18],
    scale3D: [0.28, 0.26, 0.24],
    meshType: 'sphere',
    characteristics: [
      'Distensible muscular reservoir for periodic storage and expulsion of urine',
      'Detrusor muscle: three interlaced smooth muscle layers',
      'Trigone: sensitive triangular floor between ureteric orifices & internal urethra',
      'Normal voluntary capacity 400 - 600 mL; initial sensation of fullness at ~200 mL',
    ],
    dimensions: [
      { label: 'Normal Max Capacity', value: '550', unit: 'mL', baseline: '450-600 mL' },
      { label: 'Resting Volume', value: '180', unit: 'mL', baseline: '50-300 mL' },
      { label: 'Detrusor Wall Thickness', value: '3.2', unit: 'mm', baseline: '2.5-4.0 mm' },
      { label: 'Voiding Flow Rate (Qmax)', value: '24', unit: 'mL/s', baseline: '20-30 mL/s' },
      { label: 'Post-Void Residual (PVR)', value: '8', unit: 'mL', baseline: '< 20 mL' },
    ],
    structures: [
      { id: 'ub-det', name: 'Detrusor Muscle Coat', type: 'Muscular Wall', description: 'Specialized smooth muscle contracting under parasympathetic pelvic nerve drive', status: 'nominal', anatomicalCode: 'FMA:15900' },
      { id: 'ub-tri', name: 'Bladder Trigone', type: 'Mucosal Landmark', description: 'Smooth triangular floor resistant to distension; high sensory stretch innervation', status: 'nominal', anatomicalCode: 'FMA:15911' },
      { id: 'ub-uro', name: 'Ureteral Orifices', type: 'Valve Mechanism', description: 'Oblique intramural slit valves preventing retrograde vesicoureteral reflux', status: 'nominal', anatomicalCode: 'FMA:15915' },
      { id: 'ub-sph', name: 'Internal & External Urethral Sphincters', type: 'Sphincteric Complex', description: 'Involuntary smooth muscle (internal) & voluntary striated pelvic floor (external)', status: 'nominal', anatomicalCode: 'FMA:19672' },
    ],
    bloodSupply: {
      arterial: 'Superior and Inferior Vesical Arteries (from Internal Iliac Artery)',
      venous: 'Vesical Venous Plexus draining into Internal Iliac Veins',
      perfusionRate: '45 mL/min',
      vascularResistance: 'Autonomic modulation by hypogastric and pelvic splanchnic networks',
    },
    telemetryMetrics: [
      { label: 'Intravesical Detrusor Pressure', value: '12 cmH₂O', status: 'nominal', normalRange: '8 - 18 cmH₂O', flightTolerance: '5 - 25 cmH₂O' },
      { label: 'Daily Excretion Volume', value: '1,650 mL/24h', status: 'nominal', normalRange: '1,200 - 2,000 mL', flightTolerance: '1,000 - 2,500 mL' },
      { label: 'Post-Void Residual', value: '8 mL', status: 'nominal', normalRange: '< 30 mL', flightTolerance: '< 50 mL' },
    ],
    chartConfig: {
      title: 'Cystometrogram: Intravesical Detrusor Pressure vs Fluid Volume',
      yAxisLabel: 'Detrusor Pressure (cmH₂O)',
      xAxisLabel: 'Bladder Filling Volume (mL)',
      primaryLegend: 'Active Cystometric Compliance Curve',
      secondaryLegend: 'Nominal Baseline Compliance',
      data: [
        { name: '50 mL', value: 8, secondary: 8, baseline: 8 },
        { name: '150 mL (First Urge)', value: 11, secondary: 10, baseline: 10 },
        { name: '300 mL (Normal Fullness)', value: 13, secondary: 13, baseline: 13 },
        { name: '450 mL (Urgent Sensation)', value: 18, secondary: 17, baseline: 16 },
        { name: '550 mL (Capacity)', value: 24, secondary: 22, baseline: 20 },
        { name: 'Voiding Spike', value: 68, secondary: 65, baseline: 65 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Renal Ureteral Input', relationType: 'Hydrostatic Fluid Column', pathway: 'Ureters → Intramural Tunnel', functionalRole: 'Receives continuous drops of processed urine from renal pelvis', direction: 'afferent' },
      { targetSystem: 'Pelvic Floor Autonomic Axis', relationType: 'Neural Micturition Reflex', pathway: 'Pelvic Nerves (S2-S4) & Pudendal Nerve', functionalRole: 'Voluntary coordinated sphincteric relaxation during voiding', direction: 'efferent' },
    ],
    crossSectionLabels: [
      { id: 'cs-urothelium', name: 'Transitional Urothelium', x: 35, y: 38, details: 'Umbrella cells capable of flattening under hydrostatic pressure without leakage' },
      { id: 'cs-detrusor', name: 'Interlacing Detrusor Bundles', x: 62, y: 55, details: 'Multi-directional smooth muscle creating uniform compressive emptying force' },
    ],
  },

  bones: {
    id: 'bones',
    name: 'Skeletal System & Mineral Matrix',
    latinName: 'Systema Skeletale',
    system: 'Skeletal & Mineral System',
    location: 'Axial and Appendicular Framework (206 total articulated bones)',
    color: '#cbd5e1',
    position3D: [0, 2.10, -0.05],
    scale3D: [0.95, 1.85, 0.45],
    meshType: 'skeletal',
    characteristics: [
      '206 bones divided into Axial (80 bones) & Appendicular (126 bones) skeleton',
      'Rigid composite: organic collagen matrix (30%) + hydroxyapatite mineral crystals (70%)',
      'Dynamic living tissue remodeled by osteoblasts (formation) and osteoclasts (resorption)',
      'Stores 99% of body calcium (1,000 g) and 85% of total phosphorus',
    ],
    dimensions: [
      { label: 'Total Skeletal Mass', value: '10.8', unit: 'kg', baseline: '9.5-12.0 kg' },
      { label: 'Axial Height Elongation', value: '+3.4', unit: 'cm', baseline: '+2.0 to +4.5 cm' },
      { label: 'Femoral Bone Mineral Density', value: '1.18', unit: 'g/cm²', baseline: '1.10-1.30 g/cm²' },
      { label: 'Lumbar L1-L4 T-Score', value: '+0.4', unit: 'SD', baseline: '> -1.0 SD' },
      { label: 'Trabecular Calcium Resorption', value: '0.9%', unit: 'loss/mo (unmitigated)', baseline: '< 0.2%/mo with ARED' },
    ],
    structures: [
      { id: 'sk-ax', name: 'Axial Spine (Cervical, Thoracic, Lumbar, Sacrum)', type: 'Central Axis', description: '33 vertebrae with intervertebral fibrocartilage discs undergoing zero-g expansion', status: 'nominal', anatomicalCode: 'FMA:7155' },
      { id: 'sk-rib', name: 'Thoracic Cage (12 Pairs Ribs & Sternum)', type: 'Protective Cage', description: 'Shields heart and lungs; articulates with thoracic vertebrae and costal cartilages', status: 'nominal', anatomicalCode: 'FMA:7475' },
      { id: 'sk-pel', name: 'Pelvic Girdle (Os Coxae, Ilium, Ischium, Pubis)', type: 'Weight-Bearing Basin', description: 'Primary load-bearing structure connecting spine to lower appendicular limbs', status: 'nominal', anatomicalCode: 'FMA:16580' },
      { id: 'sk-fem', name: 'Femur & Weight-Bearing Long Bones', type: 'Appendicular Skeleton', description: 'Longest, strongest bone; cortical shaft with trabecular femoral head', status: 'nominal', anatomicalCode: 'FMA:9611' },
      { id: 'sk-crt', name: 'Cortical Bone (Compact Bone)', type: 'Structural Matrix', description: 'Dense outer osteon lamellar cylinder providing torsional and compressive strength', status: 'nominal', anatomicalCode: 'FMA:24018' },
      { id: 'sk-trb', name: 'Trabecular (Cancellous/Spongy) Bone', type: 'Metabolic Matrix', description: 'Internal honeycomb lattice with high metabolic turnover and hematopoietic marrow', status: 'nominal', anatomicalCode: 'FMA:24019' },
    ],
    bloodSupply: {
      arterial: 'Nutrient Arteries, Periosteal Arteries, and Epiphyseal/Metaphyseal vessels',
      venous: 'Emissary Veins and Central Marrow Sinusoids',
      perfusionRate: '350 mL/min (7% total cardiac output)',
      vascularResistance: 'Intraosseous microvascular capillary filtration',
    },
    telemetryMetrics: [
      { label: 'Lumbar Spine T-Score', value: '+0.4 SD', status: 'nominal', normalRange: '> -1.0 SD', flightTolerance: '> -1.5 SD' },
      { label: 'Femoral Neck Bone Density', value: '1.18 g/cm²', status: 'nominal', normalRange: '1.05 - 1.35 g/cm²', flightTolerance: '> 0.95 g/cm²' },
      { label: 'Serum Ionized Calcium', value: '4.8 mg/dL', status: 'nominal', normalRange: '4.5 - 5.6 mg/dL', flightTolerance: '4.3 - 5.8 mg/dL' },
      { label: 'Urine Deoxypyridinoline (Resorption)', value: '6.4 nM/mM Cr', status: 'nominal', normalRange: '4.0 - 8.5', flightTolerance: '< 10.0' },
    ],
    chartConfig: {
      title: 'Longitudinal Bone Mineral Density (BMD) Retention with ARED Protocol',
      yAxisLabel: 'Relative Bone Density (% of Baseline)',
      xAxisLabel: 'Mission Timeline (Months in Orbit)',
      primaryLegend: 'Astronaut BMD with NASA ARED Countermeasures',
      secondaryLegend: 'Predicted Unmitigated Microgravity Decline',
      data: [
        { name: 'Launch (M0)', value: 100, secondary: 100, baseline: 100 },
        { name: 'M1', value: 99.6, secondary: 98.8, baseline: 100 },
        { name: 'M2', value: 99.4, secondary: 97.5, baseline: 100 },
        { name: 'M3', value: 99.1, secondary: 96.0, baseline: 100 },
        { name: 'M4 (Sol 142)', value: 98.9, secondary: 94.6, baseline: 100 },
        { name: 'M6 (Est)', value: 98.5, secondary: 92.0, baseline: 100 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Musculoskeletal Locomotor Chain', relationType: 'Mechanical Tendinous Anchor', pathway: 'Sharpey Fibers & Tendon Insertions', functionalRole: 'Transmission of muscular contraction force into directional motion', direction: 'reciprocal' },
      { targetSystem: 'Hematopoietic Bone Marrow', relationType: 'Stem Cell Niche', pathway: 'Trabecular Marrow Cavities (Pelvis, Sternum, Femur)', functionalRole: 'Synthesis of all red blood cells, platelets, and leukocytes', direction: 'efferent' },
      { targetSystem: 'Renal-Parathyroid Axis', relationType: 'Endocrine Mineral Buffer', pathway: 'Parathyroid Hormone (PTH) & Calcitonin', functionalRole: 'Dynamic calcium and phosphate ion mobilization/deposition', direction: 'reciprocal' },
    ],
    crossSectionLabels: [
      { id: 'cs-osteon', name: 'Haversian Osteon System', x: 35, y: 42, details: 'Concentric cylindrical lamellae surrounding central neurovascular Haversian canal' },
      { id: 'cs-trab', name: 'Trabecular Cancellous Marrow Struts', x: 68, y: 58, details: 'Stress-aligned struts providing light weight with high compressive resistance' },
    ],
  },

  muscles: {
    id: 'muscles',
    name: 'Muscular System & Motor Units',
    latinName: 'Systema Musculare',
    system: 'Musculoskeletal & Motor System',
    location: 'Somatic distribution across head, trunk, and upper/lower extremities (650+ skeletal muscles)',
    color: '#f43f5e',
    position3D: [0, 1.85, 0.10],
    scale3D: [0.90, 1.70, 0.40],
    meshType: 'skeletal',
    characteristics: [
      'Over 650 skeletal muscles comprising ~40% of total adult human body mass',
      'Dual fiber types: Type I (Slow-twitch oxidative) & Type II (Fast-twitch glycolytic)',
      'Generates mechanical force, joint locomotion, and basal core thermogenesis',
      'Prone to postural extensor atrophy (calf soleus, quadriceps) in microgravity',
    ],
    dimensions: [
      { label: 'Total Skeletal Muscle Mass', value: '31.5', unit: 'kg', baseline: '28-35 kg' },
      { label: 'Soleus Cross-Sectional Area', value: '18.2', unit: 'cm²', baseline: '17.5-20.0 cm²' },
      { label: 'Peak Isometric Knee Torque', value: '235', unit: 'N·m', baseline: '210-260 N·m' },
      { label: 'Resting Metabolic Rate Contribution', value: '22%', unit: 'total RMR', baseline: '20-25%' },
      { label: 'Daily ARED Workload Volume', value: '42,000', unit: 'kg·m', baseline: '38,000-45,000 kg·m' },
    ],
    structures: [
      { id: 'ms-sol', name: 'Soleus & Gastrocnemius (Calf Complex)', type: 'Postural Extensor', description: 'Critical antigravity postural muscles; high Type I slow-twitch density', status: 'nominal', anatomicalCode: 'FMA:22542' },
      { id: 'ms-qd', name: 'Quadriceps Femoris (Rectus, Vasti)', type: 'Weight-Bearing Extensor', description: 'Extends knee joint, essential for locomotion, axial load, and EVA mobility', status: 'nominal', anatomicalCode: 'FMA:22428' },
      { id: 'ms-lsp', name: 'Erector Spinae & Deep Paraspinal Core', type: 'Axial Stabilizer', description: 'Maintains spinal alignment; susceptible to microgravity deconditioning and elongation strain', status: 'nominal', anatomicalCode: 'FMA:71300' },
      { id: 'ms-pect', name: 'Pectoralis Major & Deltoid Complexes', type: 'Upper Extremity', description: 'Upper body pushing, overhead climbing, and spacecraft hatch manipulation', status: 'nominal', anatomicalCode: 'FMA:9625' },
      { id: 'ms-sar', name: 'Sarcomere Subunits (Actin & Myosin)', type: 'Molecular Engine', description: 'Sliding filament cross-bridge power strokes powered by ATP hydrolysis', status: 'nominal', anatomicalCode: 'FMA:67890' },
    ],
    bloodSupply: {
      arterial: 'Segmental Muscular Arteries via extensive microvascular anastomotic networks',
      venous: 'Deep Venae Comitantes with intramuscular valves ("Muscle Pump" for venous return)',
      perfusionRate: '1,000 mL/min resting; up to 15,000 mL/min during peak ARED exercise',
      vascularResistance: 'Dramatic local metabolic vasodilation via nitric oxide, adenosine, and lactate',
    },
    telemetryMetrics: [
      { label: 'Peak Muscle Torque Retention', value: '96.2%', status: 'nominal', normalRange: '> 90%', flightTolerance: '> 85%' },
      { label: 'Surface EMG Activation Amplitude', value: '480 µV', status: 'nominal', normalRange: '400 - 650 µV', flightTolerance: '350 - 700 µV' },
      { label: 'Serum Creatine Kinase (CK)', value: '142 U/L', status: 'nominal', normalRange: '55 - 170 U/L', flightTolerance: '50 - 220 U/L' },
    ],
    chartConfig: {
      title: 'Electromyographic (sEMG) Microvoltage Activation & Isometric Torque',
      yAxisLabel: 'Muscle Torque (N·m) / EMG Root-Mean-Square (µV)',
      xAxisLabel: 'Isometric Contraction Effort (% Maximal Voluntary Contraction)',
      primaryLegend: 'Quadriceps Generated Torque (N·m)',
      secondaryLegend: 'Surface EMG Muscle Activation (µV)',
      data: [
        { name: '10% MVC', value: 25, secondary: 60, baseline: 25 },
        { name: '25% MVC', value: 65, secondary: 140, baseline: 62 },
        { name: '50% MVC', value: 125, secondary: 260, baseline: 120 },
        { name: '75% MVC', value: 185, secondary: 390, baseline: 180 },
        { name: '100% Peak', value: 242, secondary: 510, baseline: 235 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Skeletal Leverage System', relationType: 'Mechanical Actuation', pathway: 'Myotendinous Junctions → Periosteum', functionalRole: 'Converts chemical sarcomere shortening into joint rotational torque', direction: 'efferent' },
      { targetSystem: 'Venous Return Muscle Pump', relationType: 'Hemodynamic Booster', pathway: 'Deep Lower Extremity Veins', functionalRole: 'Intramuscular compression assisting blood return against gravitational/inertial pooling', direction: 'efferent' },
      { targetSystem: 'Neuromuscular Motor Units', relationType: 'Direct Synaptic Innervation', pathway: 'Alpha Motor Neurons & Acetylcholine Receptors', functionalRole: 'Precision recruitment of motor unit pools for graded voluntary contractions', direction: 'afferent' },
    ],
    crossSectionLabels: [
      { id: 'cs-fascicle', name: 'Perimysium Muscle Fascicle', x: 32, y: 38, details: 'Bundle of 20-80 individual multinucleated muscle fibers surrounded by collagen sheath' },
      { id: 'cs-myo-fil', name: 'Actin-Myosin Crossbridges', x: 65, y: 62, details: 'Interdigitating thick and thin filaments sliding during ATP-dependent contraction' },
    ],
  },

  nervous: {
    id: 'nervous',
    name: 'Peripheral & Autonomic Neural Network',
    latinName: 'Systema Nervosum Periphericum',
    system: 'Neural Network System',
    location: 'Spinal cord column (C1-Co1), sympathetic trunks, peripheral nerve plexus (Brachial, Lumbosacral)',
    color: '#60a5fa',
    position3D: [0, 2.50, -0.12],
    scale3D: [0.65, 1.90, 0.35],
    meshType: 'neural',
    characteristics: [
      '31 pairs of spinal nerves + 12 cranial nerves distributing throughout all tissue planes',
      'Dual division: Somatosensory/Motor (voluntary) & Autonomic (Sympathetic / Parasympathetic)',
      'Saltatory nerve conduction along myelinated axons at velocities up to 120 m/s',
      'Autonomic baroreflex resets in microgravity due to absence of hydrostatic pressure gradient',
    ],
    dimensions: [
      { label: 'Spinal Cord Length', value: '45.0', unit: 'cm', baseline: '42-45 cm' },
      { label: 'Spinal Cord Caliber (Cervical)', value: '13.0', unit: 'mm', baseline: '12-14 mm' },
      { label: 'Motor Conduction Velocity', value: '58.5', unit: 'm/s', baseline: '50-65 m/s' },
      { label: 'Sensory Nerve Action Potential', value: '28.0', unit: 'µV', baseline: '20-35 µV' },
      { label: 'Baroreflex Sensitivity', value: '14.2', unit: 'ms/mmHg', baseline: '10-20 ms/mmHg' },
    ],
    structures: [
      { id: 'nv-sc', name: 'Spinal Cord & Conus Medullaris', type: 'Central Axis', description: 'Cylindrical nerve tissue core extending from foramen magnum to L1/L2', status: 'nominal', anatomicalCode: 'FMA:7647' },
      { id: 'nv-sym', name: 'Paravertebral Sympathetic Trunks', type: 'Autonomic Chain', description: 'Bilateral ganglionated chains coordinating fight-or-flight, heart rate, and vasoconstriction', status: 'nominal', anatomicalCode: 'FMA:6261' },
      { id: 'nv-brach', name: 'Brachial Plexus (C5-T1)', type: 'Somatic Plexus', description: 'Innervates entire pectoral girdle and upper limb (Radial, Median, Ulnar nerves)', status: 'nominal', anatomicalCode: 'FMA:5906' },
      { id: 'nv-lumb', name: 'Lumbosacral Plexus (L1-S4)', type: 'Somatic Plexus', description: 'Innervates pelvic floor and lower extremity (Femoral, Sciatic, Tibial, Peroneal nerves)', status: 'nominal', anatomicalCode: 'FMA:5914' },
      { id: 'nv-myel', name: 'Schwann Cell Myelin Sheaths & Nodes of Ranvier', type: 'Axonal Microstructure', description: 'Insulating lipid layers enabling ultra-fast saltatory action potential propagation', status: 'nominal', anatomicalCode: 'FMA:84124' },
    ],
    bloodSupply: {
      arterial: 'Anterior Spinal Artery (anterior 2/3) + Bilateral Posterior Spinal Arteries + Radicular Arteries',
      venous: 'Internal and External Vertebral Venous Plexuses (Batson plexus)',
      perfusionRate: '70 mL/min (spinal cord auto-regulated perfusion)',
      vascularResistance: 'Blood-spinal cord barrier (BSCB) maintaining strict ionic purity',
    },
    telemetryMetrics: [
      { label: 'Motor Conduction Velocity (Median)', value: '58.5 m/s', status: 'nominal', normalRange: '50 - 65 m/s', flightTolerance: '45 - 70 m/s' },
      { label: 'Baroreflex Sensitivity (BRS)', value: '14.2 ms/mmHg', status: 'nominal', normalRange: '10 - 20 ms/mmHg', flightTolerance: '8 - 25 ms/mmHg' },
      { label: 'H-Reflex Excitability Ratio', value: '0.42', status: 'nominal', normalRange: '0.35 - 0.55', flightTolerance: '0.30 - 0.60' },
    ],
    chartConfig: {
      title: 'Peripheral Nerve Compound Motor Action Potential (CMAP) Latency',
      yAxisLabel: 'Action Potential Amplitude (mV)',
      xAxisLabel: 'Conduction Latency (Milliseconds)',
      primaryLegend: 'Active Evoked CMAP Waveform',
      secondaryLegend: 'Pre-flight Calibrated Baseline',
      data: [
        { name: '0 ms (Stimulus)', value: 0, secondary: 0, baseline: 0 },
        { name: '1.5 ms', value: 0.2, secondary: 0.1, baseline: 0 },
        { name: '2.8 ms (Onset)', value: 2.4, secondary: 2.2, baseline: 2.3 },
        { name: '4.2 ms (Peak)', value: 12.8, secondary: 13.0, baseline: 12.5 },
        { name: '5.8 ms', value: -4.2, secondary: -4.0, baseline: -4.1 },
        { name: '8.0 ms (Recovery)', value: 0, secondary: 0, baseline: 0 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Central Brain Axis', relationType: 'Continuous Neural Highway', pathway: 'Ascending Sensory & Descending Corticospinal Tracts', functionalRole: 'Instantaneous two-way communication between cortex and all body extremities', direction: 'reciprocal' },
      { targetSystem: 'Visceral Autonomic Organs', relationType: 'Involuntary Homeostatic Drive', pathway: 'Sympathetic Splanchnic & Vagus Parasympathetic branches', functionalRole: 'Continuous regulation of cardiac contractility, vascular tone, and gut digestion', direction: 'efferent' },
    ],
    crossSectionLabels: [
      { id: 'cs-sp-gray', name: 'Spinal Cord Gray Horns', x: 48, y: 50, details: 'H-shaped central core containing somatic and autonomic motor neuron cell bodies' },
      { id: 'cs-sp-white', name: 'Funicular White Columns', x: 28, y: 35, details: 'Ascending dorsal columns (proprioception) and descending lateral corticospinal motor tracts' },
    ],
  },

  vessels: {
    id: 'vessels',
    name: 'Vascular Network & Hemodynamics',
    latinName: 'Systema Cardiovasculare (Vas)',
    system: 'Vascular & Hemodynamic System',
    location: 'Continuous closed-loop arborization spanning all somatic, visceral, and extremity tissues',
    color: '#dc2626',
    position3D: [0, 2.30, 0.18],
    scale3D: [0.85, 1.80, 0.35],
    meshType: 'vascular',
    characteristics: [
      'Closed 100,000-kilometer circulatory loop of arteries, arterioles, capillaries, venules, veins',
      'Arterial tree: high-pressure elastic conduit dampening pulsatile cardiac surges (Windkessel effect)',
      'Capillary beds: ~10 billion microscopic exchange vessels with single-endothelial-cell walls',
      'Venous reservoir: low-pressure capacitance system containing ~65% of total circulating blood volume',
    ],
    dimensions: [
      { label: 'Total Circulating Blood Volume', value: '4.8', unit: 'L', baseline: '4.5-5.2 L' },
      { label: 'Ascending Aorta Caliber', value: '2.8', unit: 'cm', baseline: '2.6-3.0 cm' },
      { label: 'Inferior Vena Cava Caliber', value: '2.2', unit: 'cm', baseline: '2.0-2.5 cm' },
      { label: 'Total Peripheral Resistance (TPR)', value: '1,120', unit: 'dyn·s/cm⁵', baseline: '900-1,400 dyn·s/cm⁵' },
      { label: 'Microvascular Capillary Transit', value: '0.8', unit: 'seconds', baseline: '0.7-1.0 s' },
      { label: 'Pulse Wave Velocity (PWV)', value: '6.4', unit: 'm/s', baseline: '5.5-7.5 m/s' },
    ],
    structures: [
      { id: 'vs-ao', name: 'Aorta & Major Branches', type: 'Elastic Artery', description: 'Ascending, aortic arch (brachiocephalic, common carotid, subclavian), descending aorta', status: 'nominal', anatomicalCode: 'FMA:3734' },
      { id: 'vs-ivc', name: 'Superior & Inferior Vena Cava', type: 'Great Vein', description: 'Dual large venous conduits delivering deoxygenated blood back into right atrium', status: 'nominal', anatomicalCode: 'FMA:4720' },
      { id: 'vs-art', name: 'Systemic Muscular Arterioles', type: 'Resistance Vessels', description: 'Primary site of systemic vascular resistance and blood pressure regulation', status: 'nominal', anatomicalCode: 'FMA:86001' },
      { id: 'vs-cap', name: 'Microcirculatory Capillary Beds', type: 'Exchange Bed', description: 'Single-layer endothelial tubes (5-8 µm) facilitating gas and nutrient diffusion', status: 'nominal', anatomicalCode: 'FMA:86002' },
      { id: 'vs-valv', name: 'Venous Valves', type: 'Unidirectional Flaps', description: 'Bicuspid semilunar endothelial pockets preventing retrograde venous blood pooling', status: 'nominal', anatomicalCode: 'FMA:76715' },
    ],
    bloodSupply: {
      arterial: 'Vasa Vasorum supplying large vascular walls (aorta, vena cava)',
      venous: 'Vasa Vasorum venules draining into adjacent systemic veins',
      perfusionRate: '5.0 L/min total systemic circulation',
      vascularResistance: 'Systemic Vascular Resistance (SVR) 14-20 mmHg·min/L',
    },
    telemetryMetrics: [
      { label: 'Mean Arterial Pressure (MAP)', value: '90 mmHg', status: 'nominal', normalRange: '70 - 105 mmHg', flightTolerance: '65 - 110 mmHg' },
      { label: 'Systemic Vascular Resistance (SVR)', value: '1,120 dyn·s/cm⁵', status: 'nominal', normalRange: '900 - 1,400 dyn·s/cm⁵', flightTolerance: '800 - 1,500' },
      { label: 'Arterial Pulse Wave Velocity', value: '6.4 m/s', status: 'nominal', normalRange: '5.5 - 7.5 m/s', flightTolerance: '5.0 - 8.5 m/s' },
      { label: 'Central Venous Pressure (CVP)', value: '4.8 mmHg', status: 'nominal', normalRange: '3 - 8 mmHg', flightTolerance: '2 - 10 mmHg' },
    ],
    chartConfig: {
      title: 'Pulsatile Arterial Pressure Waveform & Dicrotic Notch',
      yAxisLabel: 'Arterial Pressure (mmHg)',
      xAxisLabel: 'Cardiac Cycle Timecourse (ms)',
      primaryLegend: 'Radial Arterial Pulse Wave',
      secondaryLegend: 'Central Aortic Calibrated Pressure',
      data: [
        { name: '0 ms', value: 78, secondary: 76, baseline: 76 },
        { name: '80 ms (Systolic Peak)', value: 118, secondary: 114, baseline: 115 },
        { name: '160 ms', value: 104, secondary: 102, baseline: 100 },
        { name: '280 ms (Dicrotic Notch)', value: 88, secondary: 86, baseline: 85 },
        { name: '360 ms (Diastolic Wave)', value: 92, secondary: 90, baseline: 88 },
        { name: '600 ms (Diastolic Runoff)', value: 78, secondary: 76, baseline: 76 },
      ],
    },
    relatedSystems: [
      { targetSystem: 'Central Heart Pump', relationType: 'Direct Hydrodynamic Coupling', pathway: 'Ascending Aorta & Coronary Ostia', functionalRole: 'Receives periodic stroke volume pulses and dampens arterial pressure peaks', direction: 'afferent' },
      { targetSystem: 'All Somatic & Visceral Tissues', relationType: 'Continuous Perfusion', pathway: 'Systemic Capillary Microvascular Network', functionalRole: 'Cellular delivery of O₂, glucose, hormones, and removal of metabolic CO₂ and lactate', direction: 'efferent' },
    ],
    crossSectionLabels: [
      { id: 'cs-intima', name: 'Tunica Intima & Endothelium', x: 28, y: 35, details: 'Non-thrombogenic single endothelial layer synthesizing prostacyclin and nitric oxide' },
      { id: 'cs-media', name: 'Tunica Media (Smooth Muscle & Elastin)', x: 50, y: 52, details: 'Concentric elastic lamellae providing structural compliance and vasoconstriction' },
      { id: 'cs-adventitia', name: 'Tunica Externa (Adventitia)', x: 74, y: 68, details: 'Fibrous connective collagen sheath containing vasa vasorum and autonomic nerve fibers' },
    ],
  },
};
