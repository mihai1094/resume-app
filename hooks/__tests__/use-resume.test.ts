import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResume } from '../use-resume';
import { ResumeData } from '@/lib/types/resume';
import { generateId } from '@/lib/utils';

describe('useResume', () => {
  describe('Initial State', () => {
    it('should initialize with default resume data', () => {
      const { result } = renderHook(() => useResume());

      expect(result.current.resumeData).toBeDefined();
      expect(result.current.resumeData.personalInfo.firstName).toBe('Jordan');
      expect(result.current.resumeData.workExperience.length).toBeGreaterThan(0);
      expect(result.current.resumeData.education.length).toBeGreaterThan(0);
      expect(result.current.resumeData.skills.length).toBeGreaterThan(0);
    });

    it('should initialize with isDirty as false', () => {
      const { result } = renderHook(() => useResume());
      expect(result.current.isDirty).toBe(false);
    });

    it('should provide validation object', () => {
      const { result } = renderHook(() => useResume());
      expect(result.current.validation).toBeDefined();
      expect(result.current.validation).toHaveProperty('valid');
      expect(result.current.validation).toHaveProperty('errors');
    });
  });

  describe('Personal Info', () => {
    it('should update personal information', () => {
      const { result } = renderHook(() => useResume());

      act(() => {
        result.current.updatePersonalInfo({
          firstName: 'John',
          lastName: 'Doe',
        });
      });

      expect(result.current.resumeData.personalInfo.firstName).toBe('John');
      expect(result.current.resumeData.personalInfo.lastName).toBe('Doe');
      expect(result.current.isDirty).toBe(true);
    });

    it('should update partial personal information', () => {
      const { result } = renderHook(() => useResume());
      const originalEmail = result.current.resumeData.personalInfo.email;

      act(() => {
        result.current.updatePersonalInfo({
          firstName: 'Jane',
        });
      });

      expect(result.current.resumeData.personalInfo.firstName).toBe('Jane');
      expect(result.current.resumeData.personalInfo.email).toBe(originalEmail);
    });
  });

  describe('Work Experience', () => {
    it('should add new work experience', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.workExperience.length;

      act(() => {
        result.current.addWorkExperience();
      });

      expect(result.current.resumeData.workExperience.length).toBe(initialLength + 1);
      const newExp = result.current.resumeData.workExperience[initialLength];
      expect(newExp).toHaveProperty('id');
      expect(newExp.company).toBe('');
      expect(newExp.position).toBe('');
      expect(newExp.current).toBe(false);
      expect(result.current.isDirty).toBe(true);
    });

    it('should update existing work experience', () => {
      const { result } = renderHook(() => useResume());
      const firstExp = result.current.resumeData.workExperience[0];
      const expId = firstExp.id;

      act(() => {
        result.current.updateWorkExperience(expId, {
          company: 'New Company',
          position: 'Senior Developer',
        });
      });

      const updatedExp = result.current.resumeData.workExperience.find(
        (exp) => exp.id === expId
      );
      expect(updatedExp?.company).toBe('New Company');
      expect(updatedExp?.position).toBe('Senior Developer');
      expect(result.current.isDirty).toBe(true);
    });

    it('should not update work experience with invalid ID', () => {
      const { result } = renderHook(() => useResume());
      const initialData = result.current.resumeData.workExperience;

      act(() => {
        result.current.updateWorkExperience('invalid-id', {
          company: 'Should Not Update',
        });
      });

      expect(result.current.resumeData.workExperience).toEqual(initialData);
    });

    it('should remove work experience', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.workExperience.length;
      const firstExp = result.current.resumeData.workExperience[0];
      const expId = firstExp.id;

      act(() => {
        result.current.removeWorkExperience(expId);
      });

      expect(result.current.resumeData.workExperience.length).toBe(initialLength - 1);
      expect(
        result.current.resumeData.workExperience.find((exp) => exp.id === expId)
      ).toBeUndefined();
      expect(result.current.isDirty).toBe(true);
    });

    it('should reorder work experience', () => {
      const { result } = renderHook(() => useResume());
      const initialExps = [...result.current.resumeData.workExperience];
      const firstExpId = initialExps[0].id;
      const secondExpId = initialExps[1].id;

      act(() => {
        result.current.reorderWorkExperience(0, 1);
      });

      expect(result.current.resumeData.workExperience[0].id).toBe(secondExpId);
      expect(result.current.resumeData.workExperience[1].id).toBe(firstExpId);
      expect(result.current.isDirty).toBe(true);
    });

    it('should handle reordering with same start and end index', () => {
      const { result } = renderHook(() => useResume());
      const initialExps = [...result.current.resumeData.workExperience];

      act(() => {
        result.current.reorderWorkExperience(0, 0);
      });

      expect(result.current.resumeData.workExperience).toEqual(initialExps);
    });
  });

  describe('Education', () => {
    it('should add new education entry', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.education.length;

      act(() => {
        result.current.addEducation();
      });

      expect(result.current.resumeData.education.length).toBe(initialLength + 1);
      const newEdu = result.current.resumeData.education[initialLength];
      expect(newEdu).toHaveProperty('id');
      expect(newEdu.institution).toBe('');
      expect(newEdu.degree).toBe('');
      expect(newEdu.current).toBe(false);
      expect(result.current.isDirty).toBe(true);
    });

    it('should update existing education entry', () => {
      const { result } = renderHook(() => useResume());
      const firstEdu = result.current.resumeData.education[0];
      const eduId = firstEdu.id;

      act(() => {
        result.current.updateEducation(eduId, {
          institution: 'MIT',
          degree: 'PhD',
        });
      });

      const updatedEdu = result.current.resumeData.education.find(
        (edu) => edu.id === eduId
      );
      expect(updatedEdu?.institution).toBe('MIT');
      expect(updatedEdu?.degree).toBe('PhD');
      expect(result.current.isDirty).toBe(true);
    });

    it('should remove education entry', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.education.length;
      const firstEdu = result.current.resumeData.education[0];
      const eduId = firstEdu.id;

      act(() => {
        result.current.removeEducation(eduId);
      });

      expect(result.current.resumeData.education.length).toBe(initialLength - 1);
      expect(
        result.current.resumeData.education.find((edu) => edu.id === eduId)
      ).toBeUndefined();
      expect(result.current.isDirty).toBe(true);
    });

    it('should reorder education entries', () => {
      const { result } = renderHook(() => useResume());
      const initialEdu = [...result.current.resumeData.education];
      if (initialEdu.length < 2) {
        // Add another education entry first
        act(() => {
          result.current.addEducation();
        });
      }
      const firstEduId = result.current.resumeData.education[0].id;
      const secondEduId = result.current.resumeData.education[1].id;

      act(() => {
        result.current.reorderEducation(0, 1);
      });

      expect(result.current.resumeData.education[0].id).toBe(secondEduId);
      expect(result.current.resumeData.education[1].id).toBe(firstEduId);
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Skills', () => {
    it('should add new skill', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.skills.length;

      act(() => {
        result.current.addSkill({
          name: 'Python',
          category: 'Languages',
          level: 'advanced',
        });
      });

      expect(result.current.resumeData.skills.length).toBe(initialLength + 1);
      const newSkill = result.current.resumeData.skills[initialLength];
      expect(newSkill.name).toBe('Python');
      expect(newSkill.category).toBe('Languages');
      expect(newSkill.level).toBe('advanced');
      expect(newSkill).toHaveProperty('id');
      expect(result.current.isDirty).toBe(true);
    });

    it('should update existing skill', () => {
      const { result } = renderHook(() => useResume());
      const firstSkill = result.current.resumeData.skills[0];
      const skillId = firstSkill.id;

      act(() => {
        result.current.updateSkill(skillId, {
          level: 'expert',
        });
      });

      const updatedSkill = result.current.resumeData.skills.find(
        (skill) => skill.id === skillId
      );
      expect(updatedSkill?.level).toBe('expert');
      expect(result.current.isDirty).toBe(true);
    });

    it('should remove skill', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.skills.length;
      const firstSkill = result.current.resumeData.skills[0];
      const skillId = firstSkill.id;

      act(() => {
        result.current.removeSkill(skillId);
      });

      expect(result.current.resumeData.skills.length).toBe(initialLength - 1);
      expect(
        result.current.resumeData.skills.find((skill) => skill.id === skillId)
      ).toBeUndefined();
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Languages', () => {
    it('should add new language', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.languages?.length || 0;

      act(() => {
        result.current.addLanguage();
      });

      const languages = result.current.resumeData.languages || [];
      expect(languages.length).toBe(initialLength + 1);
      const newLang = languages[initialLength];
      expect(newLang).toHaveProperty('id');
      expect(newLang.name).toBe('');
      expect(newLang.level).toBe('conversational');
      expect(result.current.isDirty).toBe(true);
    });

    it('should handle adding language when languages array is undefined', () => {
      const { result } = renderHook(() => useResume());

      // Set languages to undefined
      act(() => {
        const data = { ...result.current.resumeData };
        data.languages = undefined;
        result.current.loadResume(data);
      });

      act(() => {
        result.current.addLanguage();
      });

      expect(result.current.resumeData.languages).toBeDefined();
      expect(result.current.resumeData.languages?.length).toBe(1);
    });

    it('should update existing language', () => {
      const { result } = renderHook(() => useResume());

      // Ensure we have at least one language
      if (!result.current.resumeData.languages || result.current.resumeData.languages.length === 0) {
        act(() => {
          result.current.addLanguage();
        });
      }

      const firstLang = result.current.resumeData.languages![0];
      const langId = firstLang.id;

      act(() => {
        result.current.updateLanguage(langId, {
          name: 'French',
          level: 'fluent',
        });
      });

      const updatedLang = result.current.resumeData.languages?.find(
        (lang) => lang.id === langId
      );
      expect(updatedLang?.name).toBe('French');
      expect(updatedLang?.level).toBe('fluent');
      expect(result.current.isDirty).toBe(true);
    });

    it('should remove language', () => {
      const { result } = renderHook(() => useResume());

      // Ensure we have at least one language
      if (!result.current.resumeData.languages || result.current.resumeData.languages.length === 0) {
        act(() => {
          result.current.addLanguage();
        });
      }

      const initialLength = result.current.resumeData.languages!.length;
      const firstLang = result.current.resumeData.languages![0];
      const langId = firstLang.id;

      act(() => {
        result.current.removeLanguage(langId);
      });

      expect(result.current.resumeData.languages?.length).toBe(initialLength - 1);
      expect(
        result.current.resumeData.languages?.find((lang) => lang.id === langId)
      ).toBeUndefined();
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Courses', () => {
    it('should add new course', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.courses?.length || 0;

      act(() => {
        result.current.addCourse();
      });

      const courses = result.current.resumeData.courses || [];
      expect(courses.length).toBe(initialLength + 1);
      const newCourse = courses[initialLength];
      expect(newCourse).toHaveProperty('id');
      expect(newCourse.name).toBe('');
      expect(result.current.isDirty).toBe(true);
    });

    it('should update existing course', () => {
      const { result } = renderHook(() => useResume());

      // Ensure we have at least one course
      if (!result.current.resumeData.courses || result.current.resumeData.courses.length === 0) {
        act(() => {
          result.current.addCourse();
        });
      }

      const firstCourse = result.current.resumeData.courses![0];
      const courseId = firstCourse.id;

      act(() => {
        result.current.updateCourse(courseId, {
          name: 'React Advanced Patterns',
          institution: 'Udemy',
        });
      });

      const updatedCourse = result.current.resumeData.courses?.find(
        (course) => course.id === courseId
      );
      expect(updatedCourse?.name).toBe('React Advanced Patterns');
      expect(updatedCourse?.institution).toBe('Udemy');
      expect(result.current.isDirty).toBe(true);
    });

    it('should remove course', () => {
      const { result } = renderHook(() => useResume());

      // Ensure we have at least one course
      if (!result.current.resumeData.courses || result.current.resumeData.courses.length === 0) {
        act(() => {
          result.current.addCourse();
        });
      }

      const initialLength = result.current.resumeData.courses!.length;
      const firstCourse = result.current.resumeData.courses![0];
      const courseId = firstCourse.id;

      act(() => {
        result.current.removeCourse(courseId);
      });

      expect(result.current.resumeData.courses?.length).toBe(initialLength - 1);
      expect(
        result.current.resumeData.courses?.find((course) => course.id === courseId)
      ).toBeUndefined();
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Hobbies', () => {
    it('should add new hobby', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.hobbies?.length || 0;

      act(() => {
        result.current.addHobby();
      });

      const hobbies = result.current.resumeData.hobbies || [];
      expect(hobbies.length).toBe(initialLength + 1);
      const newHobby = hobbies[initialLength];
      expect(newHobby).toHaveProperty('id');
      expect(newHobby.name).toBe('');
      expect(result.current.isDirty).toBe(true);
    });

    it('should update existing hobby', () => {
      const { result } = renderHook(() => useResume());

      // Ensure we have at least one hobby
      if (!result.current.resumeData.hobbies || result.current.resumeData.hobbies.length === 0) {
        act(() => {
          result.current.addHobby();
        });
      }

      const firstHobby = result.current.resumeData.hobbies![0];
      const hobbyId = firstHobby.id;

      act(() => {
        result.current.updateHobby(hobbyId, {
          name: 'Reading',
          description: 'Science fiction novels',
        });
      });

      const updatedHobby = result.current.resumeData.hobbies?.find(
        (hobby) => hobby.id === hobbyId
      );
      expect(updatedHobby?.name).toBe('Reading');
      expect(updatedHobby?.description).toBe('Science fiction novels');
      expect(result.current.isDirty).toBe(true);
    });

    it('should remove hobby', () => {
      const { result } = renderHook(() => useResume());

      // Ensure we have at least one hobby
      if (!result.current.resumeData.hobbies || result.current.resumeData.hobbies.length === 0) {
        act(() => {
          result.current.addHobby();
        });
      }

      const initialLength = result.current.resumeData.hobbies!.length;
      const firstHobby = result.current.resumeData.hobbies![0];
      const hobbyId = firstHobby.id;

      act(() => {
        result.current.removeHobby(hobbyId);
      });

      expect(result.current.resumeData.hobbies?.length).toBe(initialLength - 1);
      expect(
        result.current.resumeData.hobbies?.find((hobby) => hobby.id === hobbyId)
      ).toBeUndefined();
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Extra-Curricular', () => {
    it('should add new extra-curricular activity', () => {
      const { result } = renderHook(() => useResume());
      const initialLength = result.current.resumeData.extraCurricular?.length || 0;

      act(() => {
        result.current.addExtraCurricular();
      });

      const extra = result.current.resumeData.extraCurricular || [];
      expect(extra.length).toBe(initialLength + 1);
      const newExtra = extra[initialLength];
      expect(newExtra).toHaveProperty('id');
      expect(newExtra.title).toBe('');
      expect(newExtra.current).toBe(false);
      expect(result.current.isDirty).toBe(true);
    });

    it('should update existing extra-curricular activity', () => {
      const { result } = renderHook(() => useResume());

      // Ensure we have at least one extra-curricular
      if (!result.current.resumeData.extraCurricular || result.current.resumeData.extraCurricular.length === 0) {
        act(() => {
          result.current.addExtraCurricular();
        });
      }

      const firstExtra = result.current.resumeData.extraCurricular![0];
      const extraId = firstExtra.id;

      act(() => {
        result.current.updateExtraCurricular(extraId, {
          title: 'Volunteer Work',
          organization: 'Local Charity',
          current: true,
        });
      });

      const updatedExtra = result.current.resumeData.extraCurricular?.find(
        (extra) => extra.id === extraId
      );
      expect(updatedExtra?.title).toBe('Volunteer Work');
      expect(updatedExtra?.organization).toBe('Local Charity');
      expect(updatedExtra?.current).toBe(true);
      expect(result.current.isDirty).toBe(true);
    });

    it('should remove extra-curricular activity', () => {
      const { result } = renderHook(() => useResume());

      // Ensure we have at least one extra-curricular
      if (!result.current.resumeData.extraCurricular || result.current.resumeData.extraCurricular.length === 0) {
        act(() => {
          result.current.addExtraCurricular();
        });
      }

      const initialLength = result.current.resumeData.extraCurricular!.length;
      const firstExtra = result.current.resumeData.extraCurricular![0];
      const extraId = firstExtra.id;

      act(() => {
        result.current.removeExtraCurricular(extraId);
      });

      expect(result.current.resumeData.extraCurricular?.length).toBe(initialLength - 1);
      expect(
        result.current.resumeData.extraCurricular?.find((extra) => extra.id === extraId)
      ).toBeUndefined();
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('Reset and Load', () => {
    it('should reset resume to initial state', () => {
      const { result } = renderHook(() => useResume());

      // Make some changes
      act(() => {
        result.current.updatePersonalInfo({ firstName: 'Changed' });
        result.current.addWorkExperience();
      });

      expect(result.current.isDirty).toBe(true);

      // Reset
      act(() => {
        result.current.resetResume();
      });

      expect(result.current.resumeData.personalInfo.firstName).toBe('Jordan');
      expect(result.current.isDirty).toBe(false);
    });

    it('should load resume data', () => {
      const { result } = renderHook(() => useResume());
      const newResumeData: ResumeData = {
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '123-456-7890',
          location: 'New York',
        },
        workExperience: [],
        education: [],
        skills: [],
      };

      act(() => {
        result.current.loadResume(newResumeData);
      });

      expect(result.current.resumeData.personalInfo.firstName).toBe('Jane');
      expect(result.current.resumeData.personalInfo.lastName).toBe('Smith');
      expect(result.current.isDirty).toBe(false);
    });

    it('should handle loading resume with optional sections', () => {
      const { result } = renderHook(() => useResume());
      const newResumeData: ResumeData = {
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '123-456-7890',
          location: 'Test',
        },
        workExperience: [],
        education: [],
        skills: [],
        languages: [
          {
            id: generateId(),
            name: 'English',
            level: 'native',
          },
        ],
        courses: [],
        hobbies: [],
      };

      act(() => {
        result.current.loadResume(newResumeData);
      });

      expect(result.current.resumeData.languages).toBeDefined();
      expect(result.current.resumeData.languages?.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays when removing items', () => {
      const { result } = renderHook(() => useResume());

      // Clear work experience
      act(() => {
        const data = { ...result.current.resumeData };
        data.workExperience = [];
        result.current.loadResume(data);
      });

      // Try to remove from empty array
      act(() => {
        result.current.removeWorkExperience('non-existent-id');
      });

      expect(result.current.resumeData.workExperience.length).toBe(0);
    });

    it('should handle updating non-existent items gracefully', () => {
      const { result } = renderHook(() => useResume());
      const initialData = { ...result.current.resumeData };

      act(() => {
        result.current.updateWorkExperience('non-existent-id', {
          company: 'Should Not Update',
        });
      });

      // Data should remain unchanged
      expect(result.current.resumeData.workExperience).toEqual(initialData.workExperience);
    });

    it('should maintain data integrity after multiple operations', () => {
      const { result } = renderHook(() => useResume());
      const initialWorkExpCount = result.current.resumeData.workExperience.length;

      // Add, update, and remove
      act(() => {
        result.current.addWorkExperience();
      });

      const newExpId = result.current.resumeData.workExperience[
        result.current.resumeData.workExperience.length - 1
      ].id;

      act(() => {
        result.current.updateWorkExperience(newExpId, {
          company: 'Test Company',
        });
      });

      act(() => {
        result.current.removeWorkExperience(newExpId);
      });

      expect(result.current.resumeData.workExperience.length).toBe(initialWorkExpCount);
      expect(
        result.current.resumeData.workExperience.find((exp) => exp.id === newExpId)
      ).toBeUndefined();
    });
  });
});

