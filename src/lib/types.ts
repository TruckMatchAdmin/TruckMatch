export type DriverCategory = "spl" | "pl" | "porteur" | "vul";

export interface CategoryInfo {
  id: DriverCategory;
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  image?: string;
  permits: string[];
  description: string;
  longDescription: string;
  keySkills: string[];
  typicalMissions: string[];
}

export interface JobOffer {
  id: string;
  title: string;
  company_name: string;
  category: DriverCategory;
  location_city: string;
  location_department: string;
  contract_type: "CDI" | "CDD" | "Intérim";
  salary_range?: string;
  published_at: string;
  description: string;
  requirements: string[];
}

export interface Article {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  category: "recrutement" | "permis" | "carriere" | "reglementation";
  category_label: string;
  read_time: string;
  published_at: string;
  summary: string;
  content: {
    intro: string;
    sections: {
      title: string;
      body: string;
    }[];
    faq?: {
      question: string;
      answer: string;
    }[];
  };
}
