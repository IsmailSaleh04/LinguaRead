import { apiCall } from "./client";
import type { TargetLanguage, UserPreferences, ApiResponse } from "../types";

export const languagesApi = {
  async getTargetLanguages(): Promise<ApiResponse<TargetLanguage[]>> {
    return apiCall<TargetLanguage[]>("/api/user/languages");
  },

  async addLanguage(
    languageCode: string,
    proficiencyLevel: string,
  ): Promise<ApiResponse<TargetLanguage>> {
    return apiCall<TargetLanguage>("/api/user/languages", {
      method: "POST",
      body: JSON.stringify({ languageCode, proficiencyLevel }),
    });
  },

  async updateLanguage(
    languageCode: string,
    proficiencyLevel: string,
  ): Promise<ApiResponse<TargetLanguage>> {
    return apiCall<TargetLanguage>(`/api/user/languages/${languageCode}`, {
      method: "PUT",
      body: JSON.stringify({ proficiencyLevel }),
    });
  },

  async removeLanguage(languageCode: string): Promise<ApiResponse<any>> {
    return apiCall(`/api/user/languages/${languageCode}`, {
      method: "DELETE",
    });
  },

  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    return apiCall<UserPreferences>("/api/user/preferences");
  },

  async updatePreferences(
    data: Partial<UserPreferences>,
  ): Promise<ApiResponse<UserPreferences>> {
    return apiCall<UserPreferences>("/api/user/preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
