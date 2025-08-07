import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Pencil, Trash, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Define the shape of a Role object for type safety
interface Role {
  id: number;
  name: string;
  description: string;
  permissions: { name: string }[];
}

// Define the props that this component expects from the Laravel controller
interface Props {
  roles: Role[];
  permissions: string[];
}

// Define the breadcrumbs for this page
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

// Main App component
export default function RolesIndex({ roles }: Props) {
  // Access the permissions passed from the controller via page props
  const { permissions } = usePage().props as unknown as Props;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  // Use Inertia's useForm hook to manage the form state, now including permissions
  const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
    name: '',
    description: '',
    permissions: [] as string[], // Initialize permissions as an empty array
  });

  // Function to open the create/edit modal
  const openModal = (role?: Role) => {
    setIsModalOpen(true);
    if (role) {
      setIsEditing(true);
      setCurrentRole(role);
      // Pre-fill the form with the role data for editing
      setData({
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(p => p.name), // Set permissions from the role
      });
    } else {
      setIsEditing(false);
      setCurrentRole(null);
      // Reset the form for a new role
      reset();
    }
  };

  // Function to close the modal and reset the form
  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  // Function to open the delete confirmation modal
  const openDeleteModal = (role: Role) => {
    setCurrentRole(role);
    setIsDeleteModalOpen(true);
  };

  // Function to close the delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentRole(null);
  };

  // Handle form submission (create or update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentRole?.id) {
      // Use useForm's put method for updating with the correct URL
      put(`/roles/${currentRole.id}`, {
        onSuccess: () => closeModal(),
      });
    } else {
      // Use useForm's post method for creating with the correct URL
      post('/roles', {
        onSuccess: () => closeModal(),
      });
    }
  };

  // Handle role deletion
  const handleDelete = () => {
    if (currentRole?.id) {
      // Use useForm's destroy method for deleting with the correct URL
      destroy(`/roles/${currentRole.id}`, {
        onSuccess: () => closeDeleteModal(),
      });
    }
  };

  // Function to handle permission checkbox changes
  const handlePermissionChange = (permissionName: string, isChecked: boolean) => {
    setData('permissions', isChecked
      ? [...data.permissions, permissionName]
      : data.permissions.filter(name => name !== permissionName)
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles Management" />
      {/* The main content wrapper, now inside the AppLayout */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Roles Management</h1>
          <Button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Role
          </Button>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-600 uppercase text-sm font-semibold">
                <th className="px-5 py-3 border-b-2 border-gray-300">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-300">Description</th>
                <th className="px-5 py-3 border-b-2 border-gray-300">Permissions</th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap font-medium">{role.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-600 whitespace-no-wrap">{role.description}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map(permission => (
                        <span key={permission.name} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {permission.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={() => openModal(role)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Role"
                        variant="ghost"
                        size="icon"
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => openDeleteModal(role)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Role"
                        variant="ghost"
                        size="icon"
                      >
                        <Trash className="w-5 h-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Role Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative m-4">
              <Button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" variant="ghost" size="icon">
                <X className="w-6 h-6" />
              </Button>
              <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Role' : 'Create New Role'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                {/* Permissions Checkbox List */}
                <div className="mb-4">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded-md">
                    {permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={data.permissions.includes(permission)}
                          onCheckedChange={(checked) => handlePermissionChange(permission, Boolean(checked))}
                        />
                        <Label htmlFor={permission} className="text-sm font-normal cursor-pointer">
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                  >
                    {isEditing ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative m-4">
              <Button onClick={closeDeleteModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" variant="ghost" size="icon">
                <X className="w-6 h-6" />
              </Button>
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the role "{currentRole?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={processing}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
