import { useState, useCallback } from 'react';
import { Subject } from './types';
import { mockSubjects } from './mock-data';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubjects = subjects.filter((subject) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subject.name.toLowerCase().includes(searchLower) ||
      subject.code.toLowerCase().includes(searchLower)
    );
  });

  const addSubject = useCallback((subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subject,
      id: `subject-${Date.now()}`
    };
    setSubjects((prev) => [...prev, newSubject]);
    return newSubject;
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === id ? { ...subject, ...updates } : subject
      )
    );
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
  }, []);

  return {
    subjects,
    filteredSubjects,
    searchTerm,
    setSearchTerm,
    addSubject,
    updateSubject,
    deleteSubject
  };
}
